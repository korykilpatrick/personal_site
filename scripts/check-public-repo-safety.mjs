import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const FORBIDDEN_PATHS = [
  /^\.private\//,
  /^writing\//,
  /^\.playwright-mcp\//,
  /^public\/images\/posts\//,
  /^atlas-mobile-dossier\.png$/,
  /^\.DS_Store$/,
  /^frontend\/src\/content\/posts\/(?!README\.md$).+\.md$/,
  /^frontend\/src\/content\/posts\/(?:manifest|taxonomy|graph-layout)\.json$/,
];

const SENSITIVE_TOKEN =
  /(?:sk-[A-Za-z0-9_-]{16,}|AIza[0-9A-Za-z_-]{20,}|BEGIN [A-Z ]*PRIVATE KEY|[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12})/gi;
const SENSITIVE_TRACKED_TEXT =
  /(?:sk-[A-Za-z0-9_-]{16,}|AIza[0-9A-Za-z_-]{20,}|BEGIN [A-Z ]*PRIVATE KEY|drive\.google\.com\/(?:document|file)\/d\/)/i;

function git(args, encoding = 'utf8') {
  return execFileSync('git', args, { encoding });
}

function nullSeparated(value) {
  return value.split('\0').filter(Boolean);
}

function normalizeText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function privatePostSignatures(directory) {
  const manifestPath = path.join(directory, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return [];

  const signatures = new Set();
  const add = (value, minimumLength) => {
    if (typeof value !== 'string') return;
    const normalized = normalizeText(value);
    if (normalized.length >= minimumLength) signatures.add(normalized);
  };

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  for (const post of manifest.posts ?? []) {
    add(post.slug, 6);
    add(post.title, 8);
    add(post.dek, 24);
    for (const relation of post.relations ?? []) add(relation.reason, 32);
  }

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    add(path.basename(entry.name, '.md'), 6);
    const markdown = fs.readFileSync(path.join(directory, entry.name), 'utf8');
    for (const paragraph of markdown.split(/\n\s*\n/)) add(paragraph, 64);
  }

  return [...signatures];
}

function filesWithin(root) {
  if (!fs.existsSync(root)) return [];
  const stats = fs.statSync(root);
  if (stats.isFile()) return [root];
  return fs
    .readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name));
}

const tracked = nullSeparated(git(['ls-files', '-z']));
const staged = nullSeparated(git(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']));
const forbidden = [
  ...new Set(
    [...tracked, ...staged].filter((file) => FORBIDDEN_PATHS.some((pattern) => pattern.test(file))),
  ),
];

if (forbidden.length > 0) {
  console.error(
    `Refusing public-repository paths:\n${forbidden.map((file) => `- ${file}`).join('\n')}`,
  );
  process.exit(1);
}

const sensitiveTrackedFiles = tracked.filter((file) => {
  if (file.endsWith('package-lock.json')) return false;
  const contents = fs.readFileSync(file);
  if (contents.includes(0) || contents.byteLength > 5_000_000) return false;
  return SENSITIVE_TRACKED_TEXT.test(contents.toString('utf8'));
});

if (sensitiveTrackedFiles.length > 0) {
  console.error(
    `Refusing tracked text that resembles private source material or a credential:\n${sensitiveTrackedFiles
      .map((file) => `- ${file}`)
      .join('\n')}`,
  );
  process.exit(1);
}

const privateDirectory = process.env.PRIVATE_POSTS_DIR ?? '.private/posts';
const signatures = privatePostSignatures(privateDirectory);
if (signatures.length > 0) {
  const extraRoots = (process.env.PRIVATE_SAFETY_EXTRA_PATHS ?? '')
    .split(path.delimiter)
    .filter(Boolean);
  const candidates = [...new Set([...tracked, ...extraRoots.flatMap(filesWithin)])];
  const privateMatches = candidates.filter((file) => {
    const contents = fs.readFileSync(file);
    if (contents.includes(0) || contents.byteLength > 5_000_000) return false;
    const normalized = normalizeText(contents.toString('utf8'));
    return signatures.some((signature) => normalized.includes(signature));
  });

  if (privateMatches.length > 0) {
    console.error(
      `Refusing files that contain private post material:\n${privateMatches
        .map((file) => `- ${file}`)
        .join('\n')}`,
    );
    process.exit(1);
  }
}

const stagedDiff = git(['diff', '--cached', '-U0', '--', '.', ':!package-lock.json']);
const sensitiveAdditions = stagedDiff
  .split('\n')
  .filter((line) => line.startsWith('+') && !line.startsWith('+++'))
  .flatMap((line) => line.match(SENSITIVE_TOKEN) ?? []);
const newSensitiveAdditions = [...new Set(sensitiveAdditions)].filter((token) => {
  try {
    execFileSync('git', ['grep', '--quiet', '--fixed-strings', token, 'HEAD', '--'], {
      stdio: 'ignore',
    });
    return false;
  } catch {
    return true;
  }
});
if (newSensitiveAdditions.length > 0) {
  console.error('Refusing staged text that resembles a credential or private-source identifier.');
  process.exit(1);
}

const privateCheck =
  signatures.length > 0 ? `; ${signatures.length} private signatures checked` : '';
console.log(
  `Public-repository safety check passed (${tracked.length} tracked files inspected${privateCheck}).`,
);
