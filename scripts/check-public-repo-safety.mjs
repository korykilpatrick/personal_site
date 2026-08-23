import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

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

const SENSITIVE_ADDITION =
  /^\+.*(?:sk-[A-Za-z0-9_-]{16,}|AIza[0-9A-Za-z_-]{20,}|BEGIN [A-Z ]*PRIVATE KEY|[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12})/im;
const SENSITIVE_TRACKED_TEXT =
  /(?:sk-[A-Za-z0-9_-]{16,}|AIza[0-9A-Za-z_-]{20,}|BEGIN [A-Z ]*PRIVATE KEY|drive\.google\.com\/(?:document|file)\/d\/)/i;

function git(args, encoding = 'utf8') {
  return execFileSync('git', args, { encoding });
}

function nullSeparated(value) {
  return value.split('\0').filter(Boolean);
}

const tracked = nullSeparated(git(['ls-files', '-z']));
const staged = nullSeparated(
  git(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']),
);
const forbidden = [...new Set([...tracked, ...staged].filter((file) =>
  FORBIDDEN_PATHS.some((pattern) => pattern.test(file)),
))];

if (forbidden.length > 0) {
  console.error(`Refusing public-repository paths:\n${forbidden.map((file) => `- ${file}`).join('\n')}`);
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

const stagedDiff = git(['diff', '--cached', '-U0', '--', '.', ':!package-lock.json']);
if (SENSITIVE_ADDITION.test(stagedDiff)) {
  console.error('Refusing staged text that resembles a credential or private-source identifier.');
  process.exit(1);
}

console.log(`Public-repository safety check passed (${tracked.length} tracked files inspected).`);
