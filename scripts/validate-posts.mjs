import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { findLayoutCollisions, generateLayout } from './update-post-graph-layout.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const postsDirectory = path.join(repositoryRoot, '.private/posts');
const publicDirectory = path.join(repositoryRoot, 'public');
const postMediaDirectory = path.join(publicDirectory, 'images/posts');
const manifestPath = path.join(postsDirectory, 'manifest.json');
const taxonomyPath = path.join(postsDirectory, 'taxonomy.json');
const graphLayoutPath = path.join(postsDirectory, 'graph-layout.json');

const ALLOWED_RELATION_KINDS = new Set([
  'related',
  'continues',
  'contrasts',
  'applies',
  'echoes',
  'origin',
]);
const ALLOWED_THEME_TONES = new Set([
  'navy',
  'oxblood',
  'walnut',
  'old-gold',
  'sage',
  'plum',
  'rust',
  'slate',
]);
const ALLOWED_COMPONENTS = new Set([
  'Figure',
  'Footnote',
  'PostLink',
  'PullQuote',
  'Tweet',
  'Video',
  'YouTube',
]);
const BANNED_WORDS = [
  'delve',
  'foster',
  'leverage',
  'utilize',
  'facilitate',
  'empower',
  'streamline',
  'robust',
  'cutting-edge',
  'paradigm shift',
  'game changer',
  'this is huge',
  'this changes everything',
  'tapestry',
  'realm',
  'beacon',
  'multifaceted',
  'meticulous',
  'intricate',
  'paramount',
  'transformative',
  'elevate',
  'embark',
  'supercharge',
  'harness',
  'ever-evolving',
];

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function attributeValue(attributes, name) {
  return attributes.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1] ?? null;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isKebabCase(value) {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function validateLinkUrl(value) {
  if (typeof value !== 'string') return false;
  if (/^#[A-Za-z][\w:.-]*$/.test(value)) return true;
  if (value.startsWith('/')) {
    return !value.startsWith('//') && !/[\\\u0000-\u001f\u007f]/.test(value);
  }
  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return true;
    return url.protocol === 'mailto:' && /^[^@\s]+@[^@\s]+$/.test(url.pathname);
  } catch {
    return false;
  }
}

function markdownDestinations(markdown) {
  const destinations = [];
  const inlinePattern =
    /(!?)\[[^\]]*\]\(\s*(?:<([^>\n]+)>|([^\s)]+))(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/g;
  for (const match of markdown.matchAll(inlinePattern)) {
    destinations.push({ destination: match[2] ?? match[3], image: match[1] === '!' });
  }

  const definitionPattern = /^\s*\[[^\]]+\]:\s*(?:<([^>\n]+)>|([^\s]+))/gm;
  for (const match of markdown.matchAll(definitionPattern)) {
    destinations.push({ destination: match[1] ?? match[2], image: false });
  }
  return destinations;
}

function classifyInternalPostUrl(value) {
  try {
    const url = new URL(value, 'https://korykilpatrick.com');
    if (url.hostname.replace(/^www\./, '') !== 'korykilpatrick.com') return null;
    if (!url.pathname.startsWith('/posts/')) return null;
    const match = url.pathname.match(/^\/posts\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
    return { slug: match?.[1] ?? null };
  } catch {
    return null;
  }
}

function plainWordCount(markdown) {
  const text = markdown
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_>#~|=-]/g, ' ');
  return text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

function extractYouTubeVideoId(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    const hostname = url.hostname.replace(/^www\./, '');
    if (hostname === 'youtu.be') {
      const candidate = url.pathname.slice(1);
      return /^[\w-]{11}$/.test(candidate) ? candidate : null;
    }
    if (!['youtube.com', 'm.youtube.com'].includes(hostname)) {
      return null;
    }
    const candidate =
      url.searchParams.get('v') ?? url.pathname.match(/^\/(?:embed|shorts)\/([\w-]{11})/)?.[1];
    return candidate && /^[\w-]{11}$/.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

function validateMediaUrl(value) {
  if (typeof value !== 'string') return false;
  if (value.startsWith('/')) {
    return !value.startsWith('//') && !/[\\\u0000-\u001f\u007f]/.test(value);
  }
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function validateTweetUrl(value) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, '');
    return (
      url.protocol === 'https:' &&
      ['x.com', 'twitter.com', 'mobile.twitter.com'].includes(hostname) &&
      /\/status\/\d+/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

function validateOwnedPostMedia(value, postSlug, label, { requirePostDirectory = true } = {}) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return;

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(value, 'https://korykilpatrick.com').pathname);
  } catch {
    return;
  }
  const expectedPrefix = `/images/posts/${postSlug}/`;
  if (!pathname.startsWith('/images/posts/')) {
    if (requirePostDirectory) {
      fail(`${label}: local post media must live under ${expectedPrefix}.`);
    }
    return;
  }
  if (!pathname.startsWith(expectedPrefix)) {
    fail(`${label}: local post media must live under ${expectedPrefix}.`);
    return;
  }

  const assetPath = path.resolve(publicDirectory, pathname.slice(1));
  const ownedDirectory = `${path.resolve(postMediaDirectory, postSlug)}${path.sep}`;
  if (!assetPath.startsWith(ownedDirectory)) {
    fail(`${label}: local post media escapes its post directory.`);
    return;
  }
  if (!fs.existsSync(assetPath) || !fs.statSync(assetPath).isFile()) {
    fail(`${label}: local post media does not exist: ${pathname}.`);
  }
}

for (const [label, filePath] of [
  ['post manifest', manifestPath],
  ['post taxonomy', taxonomyPath],
  ['post graph layout', graphLayoutPath],
]) {
  if (!fs.existsSync(filePath)) fail(`Missing ${label}: ${filePath}`);
}
if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));
const graphLayout = JSON.parse(fs.readFileSync(graphLayoutPath, 'utf8'));
const posts = Array.isArray(manifest.posts) ? manifest.posts : [];
const themes = Array.isArray(taxonomy.themes) ? taxonomy.themes : [];
const concepts = Array.isArray(taxonomy.concepts) ? taxonomy.concepts : [];

if (manifest.version !== 2) fail('manifest.json must declare version 2.');
if (!Array.isArray(manifest.posts) || posts.length === 0) {
  fail('manifest.json must contain a non-empty posts array.');
}
if (taxonomy.version !== 1) fail('taxonomy.json must declare version 1.');
if (!Array.isArray(taxonomy.themes) || themes.length === 0) {
  fail('taxonomy.json must contain a non-empty themes array.');
}
if (!Array.isArray(taxonomy.concepts) || concepts.length === 0) {
  fail('taxonomy.json must contain a non-empty concepts array.');
}

const themeIds = new Set();
const themeOrders = new Set();
for (const [index, theme] of themes.entries()) {
  const label = theme?.id || `theme ${index + 1}`;
  if (!isPlainObject(theme) || !isKebabCase(theme.id)) {
    fail(`${label}: theme id must be lowercase kebab-case.`);
    continue;
  }
  if (themeIds.has(theme.id)) fail(`${label}: duplicate theme id.`);
  themeIds.add(theme.id);
  if (!isNonEmptyString(theme.title) || !isNonEmptyString(theme.description)) {
    fail(`${label}: theme title and description are required.`);
  }
  if (!Number.isInteger(theme.order) || theme.order < 1 || theme.order > themes.length) {
    fail(`${label}: theme order must be an integer from 1 through ${themes.length}.`);
  } else if (themeOrders.has(theme.order)) {
    fail(`${label}: duplicate theme order ${theme.order}.`);
  }
  themeOrders.add(theme.order);
  if (
    !isPlainObject(theme.anchor) ||
    !Number.isFinite(theme.anchor.x) ||
    !Number.isFinite(theme.anchor.y) ||
    theme.anchor.x < 0 ||
    theme.anchor.x > 1 ||
    theme.anchor.y < 0 ||
    theme.anchor.y > 1
  ) {
    fail(`${label}: anchor must contain x/y coordinates inside the normalized unit square.`);
  }
  if (!ALLOWED_THEME_TONES.has(theme.tone)) {
    fail(`${label}: unknown theme tone "${String(theme.tone)}".`);
  }
}

const conceptIds = new Set();
const conceptLabels = new Set();
for (const [index, concept] of concepts.entries()) {
  const label = concept?.id || `concept ${index + 1}`;
  if (!isPlainObject(concept) || !isKebabCase(concept.id)) {
    fail(`${label}: concept id must be lowercase kebab-case.`);
    continue;
  }
  if (conceptIds.has(concept.id)) fail(`${label}: duplicate concept id.`);
  conceptIds.add(concept.id);
  if (!isNonEmptyString(concept.label)) {
    fail(`${label}: concept label is required.`);
  } else {
    const normalizedLabel = concept.label.trim().toLocaleLowerCase();
    if (conceptLabels.has(normalizedLabel)) fail(`${label}: duplicate concept label.`);
    conceptLabels.add(normalizedLabel);
  }
  if (
    concept.aliases !== undefined &&
    (!Array.isArray(concept.aliases) ||
      concept.aliases.some((alias) => typeof alias !== 'string' || !alias.trim()))
  ) {
    fail(`${label}: aliases must be non-empty strings.`);
  }
  const aliases = Array.isArray(concept.aliases) ? concept.aliases : [];
  const normalizedAliases = aliases
    .filter((alias) => typeof alias === 'string')
    .map((alias) => alias.trim().toLocaleLowerCase());
  if (new Set(normalizedAliases).size !== normalizedAliases.length) {
    fail(`${label}: aliases must be unique, ignoring case.`);
  }
}

const slugs = new Set();
const orders = new Set();
let featuredCount = 0;

for (const [index, post] of posts.entries()) {
  const label = post?.slug || `manifest entry ${index + 1}`;
  if (!isPlainObject(post) || !isKebabCase(post.slug)) {
    fail(`${label}: slug must be lowercase kebab-case.`);
    continue;
  }
  if (slugs.has(post.slug)) fail(`${label}: duplicate slug.`);
  slugs.add(post.slug);

  for (const legacyField of ['category', 'tags', 'relatedSlugs']) {
    if (Object.prototype.hasOwnProperty.call(post, legacyField)) {
      fail(`${label}: legacy field "${legacyField}" is not allowed in manifest version 2.`);
    }
  }
  if (!Number.isInteger(post.order) || post.order < 1 || post.order > posts.length) {
    fail(`${label}: order must be an integer from 1 through ${posts.length}.`);
  } else if (orders.has(post.order)) {
    fail(`${label}: duplicate order ${post.order}.`);
  }
  orders.add(post.order);

  if (post.featured === true) featuredCount += 1;
  if (
    !isNonEmptyString(post.title) ||
    !isNonEmptyString(post.dek) ||
    !isNonEmptyString(post.sourcePeriod)
  ) {
    fail(`${label}: title, dek, and sourcePeriod are required.`);
  }
  if (!['draft', 'published'].includes(post.status)) {
    fail(`${label}: status must be draft or published.`);
  }
  if (post.status === 'published' && !isIsoDate(post.publishedAt)) {
    fail(`${label}: published posts need a real publishedAt date in YYYY-MM-DD form.`);
  } else if (post.publishedAt !== undefined && !isIsoDate(post.publishedAt)) {
    fail(`${label}: publishedAt must use a real YYYY-MM-DD date.`);
  }
  if (post.updatedAt !== undefined && !isIsoDate(post.updatedAt)) {
    fail(`${label}: updatedAt must use a real YYYY-MM-DD date.`);
  }
  if (post.socialImage !== undefined && !validateMediaUrl(post.socialImage)) {
    fail(`${label}: socialImage must be a root-relative or HTTPS URL.`);
  }

  if (!isPlainObject(post.themes) || !themeIds.has(post.themes.primary)) {
    fail(`${label}: themes.primary must name a canonical taxonomy theme.`);
  }
  const secondaryThemes = post.themes?.secondary ?? [];
  if (
    !Array.isArray(secondaryThemes) ||
    secondaryThemes.some((themeId) => !themeIds.has(themeId))
  ) {
    fail(`${label}: themes.secondary must contain only canonical taxonomy theme ids.`);
  } else {
    if (new Set(secondaryThemes).size !== secondaryThemes.length) {
      fail(`${label}: themes.secondary must not contain duplicates.`);
    }
    if (secondaryThemes.includes(post.themes.primary)) {
      fail(`${label}: the primary theme must not also appear in themes.secondary.`);
    }
  }

  if (
    !Array.isArray(post.conceptIds) ||
    post.conceptIds.length === 0 ||
    post.conceptIds.some((conceptId) => !conceptIds.has(conceptId))
  ) {
    fail(`${label}: conceptIds must contain canonical taxonomy concept ids.`);
  } else if (new Set(post.conceptIds).size !== post.conceptIds.length) {
    fail(`${label}: conceptIds must not contain duplicates.`);
  }

  if (!Array.isArray(post.relations)) {
    fail(`${label}: relations must be an array.`);
  } else {
    const relationKeys = new Set();
    for (const [relationIndex, relation] of post.relations.entries()) {
      const relationLabel = `${label}: relation ${relationIndex + 1}`;
      if (!isPlainObject(relation) || !isKebabCase(relation.to)) {
        fail(`${relationLabel} needs a kebab-case target slug.`);
        continue;
      }
      if (!ALLOWED_RELATION_KINDS.has(relation.kind)) {
        fail(`${relationLabel} has unknown kind "${String(relation.kind)}".`);
      }
      if (typeof relation.reason !== 'string' || !relation.reason.trim()) {
        fail(`${relationLabel} needs a non-empty editorial reason.`);
      }
      const relationKey = `${relation.kind}:${relation.to}`;
      if (relationKeys.has(relationKey)) fail(`${relationLabel} duplicates ${relationKey}.`);
      relationKeys.add(relationKey);
    }
  }
}

if (featuredCount !== 1) fail(`Expected exactly one featured post; found ${featuredCount}.`);

const structurallyValidPosts = posts.filter(
  (post) => isPlainObject(post) && isKebabCase(post.slug),
);
const postStatusBySlug = new Map(structurallyValidPosts.map((post) => [post.slug, post.status]));
if (fs.existsSync(postMediaDirectory)) {
  for (const entry of fs.readdirSync(postMediaDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      fail(`public/images/posts may contain only per-post directories; found ${entry.name}.`);
    } else if (!slugs.has(entry.name)) {
      fail(`public/images/posts contains an unregistered post directory: ${entry.name}.`);
    }
  }
}
for (const post of posts) {
  if (!isPlainObject(post) || !Array.isArray(post.relations)) continue;
  validateOwnedPostMedia(post.socialImage, post.slug, `${post.slug}: socialImage`);
  for (const relation of post.relations) {
    if (!isPlainObject(relation)) continue;
    if (relation.to === post.slug) {
      fail(`${post.slug}: cannot relate a post to itself.`);
    } else if (!slugs.has(relation.to)) {
      fail(`${post.slug}: relation target does not exist: ${relation.to}.`);
    } else if (post.status === 'published' && postStatusBySlug.get(relation.to) !== 'published') {
      fail(`${post.slug}: a published post cannot relate to draft ${relation.to}.`);
    }
  }
}

const markdownFiles = fs
  .readdirSync(postsDirectory)
  .filter((fileName) => fileName.endsWith('.md') && fileName !== 'README.md')
  .sort();
const expectedFiles = [...slugs].map((slug) => `${slug}.md`).sort();

for (const expectedFile of expectedFiles) {
  if (!markdownFiles.includes(expectedFile)) {
    fail(`Missing body file: ${expectedFile}.`);
  }
}
for (const markdownFile of markdownFiles) {
  if (!expectedFiles.includes(markdownFile)) {
    fail(`Unregistered post body: ${markdownFile}.`);
  }
}

const counts = [];
for (const post of posts) {
  if (!isPlainObject(post) || !isKebabCase(post.slug)) continue;
  const fileName = `${post.slug}.md`;
  const filePath = path.join(postsDirectory, fileName);
  if (!fs.existsSync(filePath)) {
    continue;
  }

  const body = fs.readFileSync(filePath, 'utf8').trim();
  const words = plainWordCount(body);
  counts.push({ slug: post.slug, words });

  if (words < 180) {
    fail(`${fileName}: only ${words} words; posts should contain at least 180 substantive words.`);
  }
  if (/^#\s+/m.test(body)) {
    fail(`${fileName}: body must not contain an H1; the page supplies the title.`);
  }
  if (/<\/?[a-z][^>]*>/.test(body)) {
    fail(
      `${fileName}: raw HTML is forbidden; use Markdown or a controlled rich-content component.`,
    );
  }
  if (/^---\s*$/m.test(body.slice(0, 200))) {
    fail(`${fileName}: do not add frontmatter; metadata belongs in manifest.json.`);
  }

  for (const { destination, image } of markdownDestinations(body)) {
    const safeDestination = image ? validateMediaUrl(destination) : validateLinkUrl(destination);
    if (!safeDestination) {
      fail(
        `${fileName}: unsafe ${image ? 'image' : 'link'} destination "${destination}"; use a root-relative path, HTTPS${image ? '' : ', mailto, or same-page anchor'}.`,
      );
      continue;
    }

    if (image) {
      validateOwnedPostMedia(destination, post.slug, `${fileName}: image destination`);
    }

    const internalPost = classifyInternalPostUrl(destination);
    if (!internalPost) continue;
    if (!internalPost.slug) {
      fail(`${fileName}: malformed internal post link: ${destination}.`);
    } else if (!slugs.has(internalPost.slug)) {
      fail(`${fileName}: broken internal post link: ${internalPost.slug}.`);
    } else if (internalPost.slug === post.slug) {
      fail(`${fileName}: body cannot link to itself.`);
    } else if (
      post.status === 'published' &&
      postStatusBySlug.get(internalPost.slug) !== 'published'
    ) {
      fail(`${fileName}: a published body cannot link to draft ${internalPost.slug}.`);
    }
  }

  const customTags = [...body.matchAll(/<\/?([A-Z][A-Za-z0-9]*)\b/g)].map((match) => match[1]);
  for (const customTag of new Set(customTags)) {
    if (!ALLOWED_COMPONENTS.has(customTag)) {
      fail(`${fileName}: unknown rich-content component <${customTag}>.`);
    }
  }

  for (const match of body.matchAll(/<Footnote\b([^>]*)>/gi)) {
    const note = attributeValue(match[1], 'note');
    if (!note?.trim()) {
      fail(`${fileName}: every Footnote needs a non-empty note attribute.`);
    } else if (note.length > 900) {
      fail(`${fileName}: footnote is ${note.length} characters; move long asides into the essay.`);
    }
  }

  const explicitFootnoteNumbers = [
    ...body.matchAll(/<Footnote\b[^>]*\bnumber="([^"]+)"[^>]*>/gi),
  ].map((match) => match[1]);
  const validExplicitNumbers = explicitFootnoteNumbers.filter((value) => /^[1-9]\d*$/.test(value));
  if (validExplicitNumbers.length !== explicitFootnoteNumbers.length) {
    fail(`${fileName}: explicit Footnote numbers must be positive integers.`);
  }
  if (new Set(validExplicitNumbers).size !== validExplicitNumbers.length) {
    fail(`${fileName}: explicit Footnote numbers must be unique.`);
  }

  for (const match of body.matchAll(/<Figure\b([^>]*)\/?\s*>/gi)) {
    const src = attributeValue(match[1], 'src');
    if (!src || !validateMediaUrl(src) || !attributeValue(match[1], 'alt')?.trim()) {
      fail(`${fileName}: every Figure needs src and alt attributes.`);
    }
    validateOwnedPostMedia(src, post.slug, `${fileName}: Figure src`);
  }

  for (const match of body.matchAll(/<YouTube\b([^>]*)\/?\s*>/gi)) {
    const url = attributeValue(match[1], 'url');
    if (!url || !extractYouTubeVideoId(url) || !attributeValue(match[1], 'title')?.trim()) {
      fail(`${fileName}: every YouTube embed needs an allowed URL and descriptive title.`);
    }
  }

  for (const match of body.matchAll(/<Video\b([^>]*)\/?\s*>/gi)) {
    const src = attributeValue(match[1], 'src');
    const poster = attributeValue(match[1], 'poster');
    const captionsSrc = attributeValue(match[1], 'captionsSrc');
    const transcriptUrl = attributeValue(match[1], 'transcriptUrl');
    const hasAccessibleAlternative = Boolean(captionsSrc || transcriptUrl);
    if (
      !src ||
      !validateMediaUrl(src) ||
      !attributeValue(match[1], 'title')?.trim() ||
      (poster && !validateMediaUrl(poster)) ||
      (captionsSrc && !validateMediaUrl(captionsSrc)) ||
      (transcriptUrl && !validateMediaUrl(transcriptUrl)) ||
      !hasAccessibleAlternative
    ) {
      fail(
        `${fileName}: every Video needs safe media URLs, a title, and captionsSrc or transcriptUrl.`,
      );
    }
    validateOwnedPostMedia(src, post.slug, `${fileName}: Video src`);
    validateOwnedPostMedia(poster, post.slug, `${fileName}: Video poster`);
    validateOwnedPostMedia(captionsSrc, post.slug, `${fileName}: Video captionsSrc`);
    validateOwnedPostMedia(transcriptUrl, post.slug, `${fileName}: Video transcriptUrl`, {
      requirePostDirectory: false,
    });
  }

  for (const match of body.matchAll(/<Tweet\b([^>]*)\/?\s*>/gi)) {
    const url = attributeValue(match[1], 'url');
    if (!url || !validateTweetUrl(url) || !attributeValue(match[1], 'fallback')?.trim()) {
      fail(`${fileName}: every Tweet needs a valid X/Twitter status URL and fallback text.`);
    }
  }

  for (const match of body.matchAll(/<PostLink\b([^>]*)>/gi)) {
    const slug = attributeValue(match[1], 'slug');
    if (!slug || !slugs.has(slug)) {
      fail(`${fileName}: PostLink points to an unknown slug: ${slug ?? '(missing)'}.`);
    } else if (post.status === 'published' && postStatusBySlug.get(slug) !== 'published') {
      fail(`${fileName}: a published PostLink cannot point to draft ${slug}.`);
    }
  }

  for (const bannedWord of BANNED_WORDS) {
    const pattern = new RegExp(
      `(^|[^\\p{L}])${bannedWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`,
      'iu',
    );
    if (pattern.test(body)) {
      fail(`${fileName}: contains banned AI-slop wording "${bannedWord}".`);
    }
  }

  const emDashCount = (body.match(/—/g) ?? []).length;
  if (emDashCount > 2) {
    warn(`${fileName}: contains ${emDashCount} em dashes; verify each one earns its place.`);
  }
}

let layoutShapeIsValid = true;
if (graphLayout.version !== 1) {
  fail('graph-layout.json must declare version 1.');
  layoutShapeIsValid = false;
}
if (graphLayout.algorithmVersion !== 'relationship-force-v1') {
  fail('graph-layout.json must use the current relationship-aware layout algorithm.');
  layoutShapeIsValid = false;
}
if (!/^sha256:[a-f0-9]{64}$/.test(graphLayout.sourceFingerprint ?? '')) {
  fail('graph-layout.json must include a valid source fingerprint.');
  layoutShapeIsValid = false;
}
if (graphLayout.coordinateSpace !== 'normalized') {
  fail('graph-layout.json coordinateSpace must be "normalized".');
  layoutShapeIsValid = false;
}
if (!Number.isFinite(graphLayout.minimumDistance) || graphLayout.minimumDistance <= 0) {
  fail('graph-layout.json minimumDistance must be a positive number.');
  layoutShapeIsValid = false;
}
if (!isPlainObject(graphLayout.nodes)) {
  fail('graph-layout.json nodes must be an object.');
  layoutShapeIsValid = false;
}

if (layoutShapeIsValid) {
  const expectedLayoutNodeIds = new Set([
    ...themes
      .filter((theme) => isPlainObject(theme) && isKebabCase(theme.id))
      .map((theme) => `theme:${theme.id}`),
    ...structurallyValidPosts.map((post) => `post:${post.slug}`),
  ]);
  const actualLayoutNodeIds = new Set(Object.keys(graphLayout.nodes));
  for (const nodeId of expectedLayoutNodeIds) {
    if (!actualLayoutNodeIds.has(nodeId)) fail(`graph-layout.json is missing node ${nodeId}.`);
  }
  for (const nodeId of actualLayoutNodeIds) {
    if (!expectedLayoutNodeIds.has(nodeId)) fail(`graph-layout.json has stale node ${nodeId}.`);
  }

  let allPointsAreValid = true;
  for (const [nodeId, point] of Object.entries(graphLayout.nodes)) {
    if (
      !isPlainObject(point) ||
      !Number.isFinite(point.x) ||
      !Number.isFinite(point.y) ||
      point.x < 0 ||
      point.x > 1 ||
      point.y < 0 ||
      point.y > 1
    ) {
      fail(`${nodeId}: graph layout point must be inside the normalized unit square.`);
      allPointsAreValid = false;
    }
  }

  for (const theme of themes) {
    if (!isPlainObject(theme) || !isKebabCase(theme.id)) continue;
    const point = graphLayout.nodes[`theme:${theme.id}`];
    if (
      point &&
      isPlainObject(theme.anchor) &&
      Number.isFinite(theme.anchor.x) &&
      Number.isFinite(theme.anchor.y) &&
      (Math.abs(point.x - theme.anchor.x) > 1e-9 || Math.abs(point.y - theme.anchor.y) > 1e-9)
    ) {
      fail(`theme:${theme.id}: graph layout position must equal its taxonomy anchor.`);
    }
  }

  if (allPointsAreValid) {
    const collisions = findLayoutCollisions(graphLayout.nodes, graphLayout.minimumDistance);
    for (const collision of collisions) {
      fail(
        `graph-layout.json collision: ${collision.leftId} and ${collision.rightId} are ${collision.distance} apart.`,
      );
    }

    try {
      const generatedLayout = generateLayout({
        posts,
        taxonomy,
        existingLayout: graphLayout,
        minimumDistance: graphLayout.minimumDistance,
      });
      if (JSON.stringify(generatedLayout) !== JSON.stringify(graphLayout)) {
        fail('graph-layout.json is stale; run npm run posts:layout.');
      }
    } catch (error) {
      fail(
        `graph-layout.json could not be regenerated: ${error instanceof Error ? error.message : String(error)}.`,
      );
    }
  }
}

for (const warning of warnings) {
  console.warn(`WARN: ${warning}`);
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`ERROR: ${error}`);
  }
  console.error(
    `\nPost validation failed with ${errors.length} error${errors.length === 1 ? '' : 's'}.`,
  );
  process.exit(1);
}

const totalWords = counts.reduce((sum, post) => sum + post.words, 0);
console.log(`Validated ${posts.length} posts (${totalWords.toLocaleString()} words).`);
for (const { slug, words } of counts.sort((a, b) => a.words - b.words)) {
  console.log(`${String(words).padStart(5)}  ${slug}`);
}
