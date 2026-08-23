#!/usr/bin/env node

import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const DEFAULT_POSTS_DIRECTORY = path.join(repositoryRoot, '.private/posts');
const DEFAULT_MANIFEST = path.join(DEFAULT_POSTS_DIRECTORY, 'manifest.json');
const DEFAULT_TAXONOMY = path.join(DEFAULT_POSTS_DIRECTORY, 'taxonomy.json');
const DEFAULT_LAYOUT = path.join(DEFAULT_POSTS_DIRECTORY, 'graph-layout.json');

/** Bump whenever a force, weight, or placement rule changes. */
const ALGORITHM_VERSION = 'relationship-force-v1';
const DEFAULT_MINIMUM_DISTANCE = 0.055;
const BOUNDARY_GUTTER = 0.035;
const SIMULATION_SIZE = 1000;
const SIMULATION_TICKS = 720;
const COLLISION_SETTLING_TICKS = 180;
const INFERENCE_MINIMUM_SCORE = 3.5;
const INFERENCE_MAXIMUM_DEGREE = 3;

const PROVENANCE_PRIORITY = {
  inferred: 1,
  'body-link': 2,
  authored: 3,
};

const compareStrings = (left, right) => (left < right ? -1 : left > right ? 1 : 0);
const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

export function hashSlug(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 0x100000000;
  };
}

function isPoint(value) {
  return (
    value &&
    Number.isFinite(value.x) &&
    Number.isFinite(value.y) &&
    value.x >= 0 &&
    value.x <= 1 &&
    value.y >= 0 &&
    value.y <= 1
  );
}

function distance(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function primaryThemeId(post) {
  const themeId = post.themes?.primary;
  if (!themeId) {
    throw new Error(`${post.slug}: no primary theme is available for layout placement`);
  }
  return themeId;
}

function canonicalPostPair(left, right) {
  return compareStrings(left, right) <= 0 ? `${left}|${right}` : `${right}|${left}`;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => compareStrings(left, right))
      .map(([key, entry]) => [key, stableValue(entry)]),
  );
}

function sourceFingerprint({ posts, taxonomy, bodyLinks, minimumDistance }) {
  const relevantPosts = [...posts]
    .sort((left, right) => compareStrings(left.slug, right.slug))
    .map((post) => ({
      slug: post.slug,
      order: post.order,
      themes: post.themes,
      conceptIds: post.conceptIds,
      relations: post.relations,
    }));
  const source = stableValue({
    algorithmVersion: ALGORITHM_VERSION,
    inference: {
      maximumDegree: INFERENCE_MAXIMUM_DEGREE,
      minimumScore: INFERENCE_MINIMUM_SCORE,
    },
    minimumDistance,
    taxonomy,
    posts: relevantPosts,
    bodyLinks,
  });
  const digest = createHash('sha256').update(JSON.stringify(source)).digest('hex');
  return `sha256:${digest}`;
}

function classifyInternalPostUrl(value) {
  try {
    const url = new URL(value, 'https://korykilpatrick.com');
    if (url.hostname.replace(/^www\./, '') !== 'korykilpatrick.com') return null;
    return url.pathname.match(/^\/posts\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/)?.[1] ?? null;
  } catch {
    return null;
  }
}

export function extractBodyLinkSlugs(body) {
  const links = new Set();
  const markdownLinkPattern = /(?<!!)\[[^\]]*\]\(\s*(?:<([^>\n]+)>|([^\s)]+))/g;
  for (const match of body.matchAll(markdownLinkPattern)) {
    const slug = classifyInternalPostUrl(match[1] ?? match[2]);
    if (slug) links.add(slug);
  }
  for (const match of body.matchAll(/<PostLink\b[^>]*\bslug=["']([a-z0-9-]+)["'][^>]*>/g)) {
    links.add(match[1]);
  }
  return [...links].sort(compareStrings);
}

function discoverBodyLinks(posts, postsDirectory = DEFAULT_POSTS_DIRECTORY) {
  return Object.fromEntries(
    [...posts]
      .sort((left, right) => compareStrings(left.slug, right.slug))
      .map((post) => {
        const bodyPath = path.join(postsDirectory, `${post.slug}.md`);
        if (!fs.existsSync(bodyPath)) return [post.slug, []];
        const targets = extractBodyLinkSlugs(fs.readFileSync(bodyPath, 'utf8')).filter(
          (targetSlug) => targetSlug !== post.slug,
        );
        return [post.slug, targets];
      }),
  );
}

function inferredRelationshipPairs(posts, excludedPairs) {
  const conceptFrequency = new Map();
  for (const post of posts) {
    for (const conceptId of post.conceptIds ?? []) {
      conceptFrequency.set(conceptId, (conceptFrequency.get(conceptId) ?? 0) + 1);
    }
  }

  const candidates = [];
  for (let leftIndex = 0; leftIndex < posts.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < posts.length; rightIndex += 1) {
      const left = posts[leftIndex];
      const right = posts[rightIndex];
      const pair = canonicalPostPair(left.slug, right.slug);
      if (excludedPairs.has(pair)) continue;

      const leftThemes = new Set([primaryThemeId(left), ...(left.themes?.secondary ?? [])]);
      const rightThemes = new Set([primaryThemeId(right), ...(right.themes?.secondary ?? [])]);
      const sharedThemes = [...leftThemes].filter((themeId) => rightThemes.has(themeId));
      const sharedConcepts = (left.conceptIds ?? []).filter((conceptId) =>
        (right.conceptIds ?? []).includes(conceptId),
      );

      let score = primaryThemeId(left) === primaryThemeId(right) ? 4 : sharedThemes.length * 2;
      if (primaryThemeId(left) === primaryThemeId(right)) {
        score += Math.max(0, sharedThemes.length - 1);
      }
      for (const conceptId of sharedConcepts) {
        const frequency = conceptFrequency.get(conceptId) ?? posts.length;
        score += 1 + Math.log(posts.length / Math.max(1, frequency));
      }
      score = Number(score.toFixed(6));
      if (score >= INFERENCE_MINIMUM_SCORE) {
        candidates.push({ left: left.slug, right: right.slug, pair, score });
      }
    }
  }

  candidates.sort(
    (left, right) =>
      right.score - left.score ||
      compareStrings(left.left, right.left) ||
      compareStrings(left.right, right.right),
  );

  const degree = new Map();
  const selected = [];
  for (const candidate of candidates) {
    const leftDegree = degree.get(candidate.left) ?? 0;
    const rightDegree = degree.get(candidate.right) ?? 0;
    if (leftDegree >= INFERENCE_MAXIMUM_DEGREE || rightDegree >= INFERENCE_MAXIMUM_DEGREE) {
      continue;
    }
    degree.set(candidate.left, leftDegree + 1);
    degree.set(candidate.right, rightDegree + 1);
    selected.push(candidate);
  }
  return selected;
}

function buildRelationshipPairs(posts, bodyLinks) {
  const postSlugs = new Set(posts.map((post) => post.slug));
  const relationshipByPair = new Map();

  const register = (left, right, provenance, rank = undefined, score = undefined) => {
    if (left === right || !postSlugs.has(left) || !postSlugs.has(right)) return;
    const pair = canonicalPostPair(left, right);
    const current = relationshipByPair.get(pair);
    if (current && PROVENANCE_PRIORITY[current.provenance] > PROVENANCE_PRIORITY[provenance]) {
      return;
    }
    if (current && current.provenance === provenance) {
      if ((current.rank ?? Number.MAX_SAFE_INTEGER) <= (rank ?? Number.MAX_SAFE_INTEGER)) return;
    }
    relationshipByPair.set(pair, { left, right, pair, provenance, rank, score });
  };

  for (const post of posts) {
    for (const [rank, relation] of (post.relations ?? []).entries()) {
      register(post.slug, relation.to, 'authored', rank);
    }
  }
  for (const sourceSlug of [...postSlugs].sort(compareStrings)) {
    for (const targetSlug of bodyLinks[sourceSlug] ?? []) {
      register(sourceSlug, targetSlug, 'body-link');
    }
  }

  const evidencedPairs = new Set(relationshipByPair.keys());
  for (const inferred of inferredRelationshipPairs(posts, evidencedPairs)) {
    register(inferred.left, inferred.right, 'inferred', undefined, inferred.score);
  }

  return [...relationshipByPair.values()].sort((left, right) =>
    compareStrings(left.pair, right.pair),
  );
}

function initialPostPoint(slug, anchor) {
  const angleHash = hashSlug(`${slug}:angle`) / 0x100000000;
  const radiusHash = hashSlug(`${slug}:radius`) / 0x100000000;
  const angle = angleHash * Math.PI * 2;
  const radius = 72 + radiusHash * 92;
  const minimum = BOUNDARY_GUTTER * SIMULATION_SIZE;
  const maximum = (1 - BOUNDARY_GUTTER) * SIMULATION_SIZE;
  return {
    x: clamp(anchor.x * SIMULATION_SIZE + Math.cos(angle) * radius, minimum, maximum),
    y: clamp(anchor.y * SIMULATION_SIZE + Math.sin(angle) * radius, minimum, maximum),
  };
}

function relationshipForceParameters(relationship, postBySlug, themeById) {
  const leftTheme = themeById.get(primaryThemeId(postBySlug.get(relationship.left)));
  const rightTheme = themeById.get(primaryThemeId(postBySlug.get(relationship.right)));
  const anchorDistance = distance(leftTheme.anchor, rightTheme.anchor) * SIMULATION_SIZE;
  const sameTheme = leftTheme.id === rightTheme.id;
  const base = {
    authored: { distance: 108, strength: 0.19 },
    'body-link': { distance: 128, strength: 0.105 },
    inferred: { distance: 158, strength: 0.038 },
  }[relationship.provenance];

  if (sameTheme) return base;
  return {
    distance: Math.max(base.distance, anchorDistance * 0.68),
    strength: base.strength * 0.52,
  };
}

function clampSimulationNodes(nodes) {
  const minimum = BOUNDARY_GUTTER * SIMULATION_SIZE;
  const maximum = (1 - BOUNDARY_GUTTER) * SIMULATION_SIZE;
  for (const node of nodes) {
    if (node.kind === 'theme') continue;
    node.x = clamp(node.x, minimum, maximum);
    node.y = clamp(node.y, minimum, maximum);
  }
}

function runForceLayout({ posts, taxonomy, bodyLinks, minimumDistance }) {
  const themeById = new Map(taxonomy.themes.map((theme) => [theme.id, theme]));
  const postBySlug = new Map(posts.map((post) => [post.slug, post]));
  const nodes = [];

  for (const theme of [...taxonomy.themes].sort(
    (left, right) => left.order - right.order || compareStrings(left.id, right.id),
  )) {
    if (!isPoint(theme.anchor))
      throw new Error(`${theme.id}: theme anchor is outside the unit square`);
    nodes.push({
      id: `theme:${theme.id}`,
      kind: 'theme',
      themeId: theme.id,
      x: theme.anchor.x * SIMULATION_SIZE,
      y: theme.anchor.y * SIMULATION_SIZE,
      fx: theme.anchor.x * SIMULATION_SIZE,
      fy: theme.anchor.y * SIMULATION_SIZE,
    });
  }

  const sortedPosts = [...posts].sort((left, right) => compareStrings(left.slug, right.slug));
  for (const post of sortedPosts) {
    const themeId = primaryThemeId(post);
    const theme = themeById.get(themeId);
    if (!theme) throw new Error(`${post.slug}: unknown primary theme ${themeId}`);
    const initial = initialPostPoint(post.slug, theme.anchor);
    nodes.push({
      id: `post:${post.slug}`,
      kind: 'post',
      slug: post.slug,
      primaryThemeId: themeId,
      primaryX: theme.anchor.x * SIMULATION_SIZE,
      primaryY: theme.anchor.y * SIMULATION_SIZE,
      x: initial.x,
      y: initial.y,
    });
  }

  const links = sortedPosts.map((post) => ({
    source: `post:${post.slug}`,
    target: `theme:${primaryThemeId(post)}`,
    distance: 132,
    strength: 0.23,
    provenance: 'theme',
  }));
  for (const relationship of buildRelationshipPairs(sortedPosts, bodyLinks)) {
    const parameters = relationshipForceParameters(relationship, postBySlug, themeById);
    links.push({
      source: `post:${relationship.left}`,
      target: `post:${relationship.right}`,
      distance: parameters.distance,
      strength: parameters.strength,
      provenance: relationship.provenance,
    });
  }

  const collisionRadius = (minimumDistance * SIMULATION_SIZE + 3) / 2;
  const simulation = forceSimulation(nodes)
    .randomSource(seededRandom(hashSlug(ALGORITHM_VERSION)))
    .alpha(1)
    .alphaMin(0.001)
    .alphaDecay(1 - Math.pow(0.001, 1 / SIMULATION_TICKS))
    .velocityDecay(0.34)
    .force(
      'link',
      forceLink(links)
        .id((node) => node.id)
        .distance((link) => link.distance)
        .strength((link) => link.strength)
        .iterations(2),
    )
    .force(
      'charge',
      forceManyBody()
        .strength((node) => (node.kind === 'theme' ? -125 : -82))
        .distanceMin(42)
        .distanceMax(360),
    )
    .force('collision', forceCollide(collisionRadius).strength(1).iterations(4))
    .force(
      'theme-x',
      forceX((node) => node.primaryX ?? node.x).strength((node) =>
        node.kind === 'post' ? 0.016 : 0,
      ),
    )
    .force(
      'theme-y',
      forceY((node) => node.primaryY ?? node.y).strength((node) =>
        node.kind === 'post' ? 0.016 : 0,
      ),
    )
    .stop();

  for (let tick = 0; tick < SIMULATION_TICKS; tick += 1) {
    simulation.tick();
    clampSimulationNodes(nodes);
  }

  // Remove semantic forces for a short final pass. The slightly generous collision
  // radius survives six-decimal serialization without changing the settled topology.
  simulation
    .force('link', null)
    .force('charge', null)
    .force('theme-x', null)
    .force('theme-y', null)
    .force('collision', forceCollide(collisionRadius).strength(1).iterations(8))
    .alpha(0.35)
    .alphaDecay(1 - Math.pow(0.001, 1 / COLLISION_SETTLING_TICKS));
  for (let tick = 0; tick < COLLISION_SETTLING_TICKS; tick += 1) {
    simulation.tick();
    clampSimulationNodes(nodes);
  }
  simulation.stop();

  return Object.fromEntries(
    nodes
      .map((node) => [
        node.id,
        {
          x: Number((node.x / SIMULATION_SIZE).toFixed(6)),
          y: Number((node.y / SIMULATION_SIZE).toFixed(6)),
        },
      ])
      .sort(([left], [right]) => compareStrings(left, right)),
  );
}

export function findLayoutCollisions(nodes, minimumDistance = DEFAULT_MINIMUM_DISTANCE) {
  const entries = Object.entries(nodes).sort(([left], [right]) => compareStrings(left, right));
  const collisions = [];
  for (let leftIndex = 0; leftIndex < entries.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < entries.length; rightIndex += 1) {
      const [leftId, leftPoint] = entries[leftIndex];
      const [rightId, rightPoint] = entries[rightIndex];
      const measuredDistance = distance(leftPoint, rightPoint);
      if (measuredDistance < minimumDistance) {
        collisions.push({
          leftId,
          rightId,
          distance: Number(measuredDistance.toFixed(6)),
        });
      }
    }
  }
  return collisions;
}

export function generateLayout({
  posts,
  taxonomy,
  bodyLinks,
  postsDirectory = DEFAULT_POSTS_DIRECTORY,
  minimumDistance = DEFAULT_MINIMUM_DISTANCE,
}) {
  if (!Number.isFinite(minimumDistance) || minimumDistance <= 0) {
    throw new Error('minimumDistance must be a positive number');
  }
  if (!Array.isArray(posts) || !Array.isArray(taxonomy?.themes)) {
    throw new Error('posts and taxonomy themes are required to generate a layout');
  }

  const discoveredBodyLinks = bodyLinks ?? discoverBodyLinks(posts, postsDirectory);
  const nodes = runForceLayout({
    posts,
    taxonomy,
    bodyLinks: discoveredBodyLinks,
    minimumDistance,
  });

  const collisions = findLayoutCollisions(nodes, minimumDistance);
  if (collisions.length > 0) {
    const first = collisions[0];
    throw new Error(
      `Layout collision: ${first.leftId} and ${first.rightId} are ${first.distance} apart`,
    );
  }
  for (const [nodeId, point] of Object.entries(nodes)) {
    if (!isPoint(point))
      throw new Error(`${nodeId}: generated position is outside the unit square`);
  }

  return {
    version: 1,
    algorithmVersion: ALGORITHM_VERSION,
    sourceFingerprint: sourceFingerprint({
      posts,
      taxonomy,
      bodyLinks: discoveredBodyLinks,
      minimumDistance,
    }),
    coordinateSpace: 'normalized',
    minimumDistance,
    nodes,
  };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseArguments(argv) {
  const options = {
    manifestPath: DEFAULT_MANIFEST,
    taxonomyPath: DEFAULT_TAXONOMY,
    layoutPath: DEFAULT_LAYOUT,
    check: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--check') {
      options.check = true;
    } else if (argument === '--manifest' || argument === '--taxonomy' || argument === '--layout') {
      const value = argv[index + 1];
      if (!value) throw new Error(`${argument} needs a path`);
      index += 1;
      const resolved = path.resolve(value);
      if (argument === '--manifest') options.manifestPath = resolved;
      if (argument === '--taxonomy') options.taxonomyPath = resolved;
      if (argument === '--layout') options.layoutPath = resolved;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return options;
}

export function runLayoutUpdate(options) {
  const manifest = readJson(options.manifestPath);
  const taxonomy = readJson(options.taxonomyPath);
  const existingLayout = fs.existsSync(options.layoutPath)
    ? readJson(options.layoutPath)
    : undefined;
  const layout = generateLayout({
    posts: manifest.posts,
    taxonomy,
    postsDirectory: path.dirname(options.manifestPath),
    minimumDistance: existingLayout?.minimumDistance ?? DEFAULT_MINIMUM_DISTANCE,
  });
  const serialized = `${JSON.stringify(layout, null, 2)}\n`;

  if (options.check) {
    if (!existingLayout) throw new Error(`Missing layout file: ${options.layoutPath}`);
    const current = `${JSON.stringify(existingLayout, null, 2)}\n`;
    if (current !== serialized) {
      throw new Error('Post graph layout is stale; run update-post-graph-layout.mjs');
    }
    return layout;
  }

  fs.mkdirSync(path.dirname(options.layoutPath), { recursive: true });
  fs.writeFileSync(options.layoutPath, serialized);
  return layout;
}

function main() {
  try {
    const options = parseArguments(process.argv.slice(2));
    const layout = runLayoutUpdate(options);
    const action = options.check ? 'Checked' : 'Updated';
    console.log(`${action} ${Object.keys(layout.nodes).length} graph positions.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main();
}
