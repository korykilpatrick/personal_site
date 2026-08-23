import type {
  AuthoredRelationKind,
  ConceptId,
  ContentEdge,
  ContentGraph,
  ContentNode,
  ContentNodeId,
  ContentTaxonomy,
  PostMetadataV2,
  PostNodeId,
  PostSlug,
  PostSummary,
  ThemeId,
} from '../types';

export type GraphVisibility = 'all' | 'published';

export interface GraphInferenceOptions {
  maximumDegree: number;
  minimumScore: number;
}

export interface CompileContentGraphInput {
  posts: readonly PostMetadataV2[];
  taxonomy: ContentTaxonomy;
  /** Required so draft inclusion is always an intentional caller decision. */
  visibility: GraphVisibility;
  bodyLinks?: Readonly<Record<PostSlug, readonly PostSlug[] | undefined>>;
  inference?: Partial<GraphInferenceOptions>;
}

interface InferredCandidate {
  fromSlug: PostSlug;
  toSlug: PostSlug;
  score: number;
  reason: string;
}

const DEFAULT_INFERENCE: GraphInferenceOptions = {
  maximumDegree: 3,
  minimumScore: 3.5,
};

const UNDIRECTED_AUTHORED_KINDS = new Set<AuthoredRelationKind>([
  'related',
  'contrasts',
  'echoes',
]);

const compareStrings = (left: string, right: string) =>
  left < right ? -1 : left > right ? 1 : 0;

const postNodeId = (slug: PostSlug): PostNodeId => `post:${slug}`;
const themeNodeId = (id: ThemeId): `theme:${string}` => `theme:${id}`;
const conceptNodeId = (id: ConceptId): `concept:${string}` => `concept:${id}`;

const canonicalPostPair = (left: PostSlug, right: PostSlug) =>
  compareStrings(left, right) <= 0 ? `${left}|${right}` : `${right}|${left}`;

function formatList(values: readonly string[]): string {
  if (values.length === 0) return '';
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`;
}

function assertUniqueIds(values: readonly string[], label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      throw new Error(`Duplicate ${label} id: ${value}`);
    }
    seen.add(value);
  }
}

function validateInput(input: CompileContentGraphInput): void {
  if (input.visibility !== 'all' && input.visibility !== 'published') {
    throw new Error(`Unknown graph visibility: ${String(input.visibility)}`);
  }
  if (input.taxonomy.version !== 1) {
    throw new Error(`Unsupported taxonomy version: ${String(input.taxonomy.version)}`);
  }

  assertUniqueIds(input.posts.map((post) => post.slug), 'post');
  assertUniqueIds(input.taxonomy.themes.map((theme) => theme.id), 'theme');
  assertUniqueIds(input.taxonomy.concepts.map((concept) => concept.id), 'concept');

  const postSlugs = new Set(input.posts.map((post) => post.slug));
  const themeIds = new Set(input.taxonomy.themes.map((theme) => theme.id));
  const conceptIds = new Set(input.taxonomy.concepts.map((concept) => concept.id));

  for (const post of input.posts) {
    if (!themeIds.has(post.themes.primary)) {
      throw new Error(`${post.slug}: unknown primary theme ${post.themes.primary}`);
    }

    const secondaryThemes = post.themes.secondary ?? [];
    if (secondaryThemes.includes(post.themes.primary)) {
      throw new Error(`${post.slug}: primary theme cannot also be secondary`);
    }
    assertUniqueIds(secondaryThemes, `${post.slug} secondary theme`);
    for (const themeId of secondaryThemes) {
      if (!themeIds.has(themeId)) {
        throw new Error(`${post.slug}: unknown secondary theme ${themeId}`);
      }
    }

    assertUniqueIds(post.conceptIds, `${post.slug} concept`);
    for (const conceptId of post.conceptIds) {
      if (!conceptIds.has(conceptId)) {
        throw new Error(`${post.slug}: unknown concept ${conceptId}`);
      }
    }

    for (const relation of post.relations) {
      if (relation.to === post.slug) {
        throw new Error(`${post.slug}: a post cannot relate to itself`);
      }
      if (!postSlugs.has(relation.to)) {
        throw new Error(`${post.slug}: relation target does not exist: ${relation.to}`);
      }
      if (!relation.reason.trim()) {
        throw new Error(`${post.slug}: relation to ${relation.to} needs a reason`);
      }
    }
  }

  for (const [sourceSlug, targets = []] of Object.entries(input.bodyLinks ?? {})) {
    if (!postSlugs.has(sourceSlug)) {
      throw new Error(`Body-link source does not exist: ${sourceSlug}`);
    }
    for (const targetSlug of targets) {
      if (!postSlugs.has(targetSlug)) {
        throw new Error(`${sourceSlug}: body-link target does not exist: ${targetSlug}`);
      }
    }
  }
}

function buildInferenceCandidates(
  posts: readonly PostSummary[],
  taxonomy: ContentTaxonomy,
  excludedPairs: ReadonlySet<string>,
  minimumScore: number,
): InferredCandidate[] {
  const themeById = new Map(taxonomy.themes.map((theme) => [theme.id, theme]));
  const conceptById = new Map(taxonomy.concepts.map((concept) => [concept.id, concept]));
  const conceptFrequency = new Map<ConceptId, number>();

  for (const post of posts) {
    for (const conceptId of post.conceptIds) {
      conceptFrequency.set(conceptId, (conceptFrequency.get(conceptId) ?? 0) + 1);
    }
  }

  const candidates: InferredCandidate[] = [];
  for (let leftIndex = 0; leftIndex < posts.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < posts.length; rightIndex += 1) {
      const left = posts[leftIndex];
      const right = posts[rightIndex];
      const pairKey = canonicalPostPair(left.slug, right.slug);
      if (excludedPairs.has(pairKey)) continue;

      const leftThemes = new Set([left.themes.primary, ...(left.themes.secondary ?? [])]);
      const rightThemes = new Set([right.themes.primary, ...(right.themes.secondary ?? [])]);
      const sharedThemes = [...leftThemes]
        .filter((themeId) => rightThemes.has(themeId))
        .sort(compareStrings);
      const sharedConcepts = left.conceptIds
        .filter((conceptId) => right.conceptIds.includes(conceptId))
        .sort(compareStrings);

      let score = left.themes.primary === right.themes.primary ? 4 : sharedThemes.length * 2;
      if (left.themes.primary === right.themes.primary) {
        score += Math.max(0, sharedThemes.length - 1);
      }
      for (const conceptId of sharedConcepts) {
        const frequency = conceptFrequency.get(conceptId) ?? posts.length;
        score += 1 + Math.log(posts.length / Math.max(1, frequency));
      }

      score = Number(score.toFixed(6));
      if (score < minimumScore) continue;

      const reasonParts: string[] = [];
      if (sharedThemes.length > 0) {
        const themeTitles = sharedThemes
          .map((themeId) => themeById.get(themeId)?.title)
          .filter((title): title is string => Boolean(title));
        if (themeTitles.length > 0) {
          reasonParts.push(
            `${formatList(themeTitles)} ${themeTitles.length === 1 ? 'theme' : 'themes'}`,
          );
        }
      }
      if (sharedConcepts.length > 0) {
        const conceptLabels = sharedConcepts
          .slice(0, 3)
          .map((conceptId) => conceptById.get(conceptId)?.label)
          .filter((label): label is string => Boolean(label));
        if (conceptLabels.length > 0) reasonParts.push(formatList(conceptLabels));
      }

      const [fromSlug, toSlug] = [left.slug, right.slug].sort(compareStrings);
      candidates.push({
        fromSlug,
        toSlug,
        score,
        reason: `Shares ${formatList(reasonParts)}.`,
      });
    }
  }

  return candidates.sort(
    (left, right) =>
      right.score - left.score ||
      compareStrings(left.fromSlug, right.fromSlug) ||
      compareStrings(left.toSlug, right.toSlug),
  );
}

function compareEdges(left: ContentEdge, right: ContentEdge): number {
  const provenanceOrder: Record<ContentEdge['provenance'], number> = {
    authored: 0,
    'body-link': 1,
    inferred: 2,
  };
  return (
    provenanceOrder[left.provenance] - provenanceOrder[right.provenance] ||
    compareStrings(left.from, right.from) ||
    (left.rank ?? Number.MAX_SAFE_INTEGER) - (right.rank ?? Number.MAX_SAFE_INTEGER) ||
    compareStrings(left.kind, right.kind) ||
    compareStrings(left.to, right.to)
  );
}

export function compileContentGraph(input: CompileContentGraphInput): ContentGraph {
  validateInput(input);

  const inference = { ...DEFAULT_INFERENCE, ...input.inference };
  if (!Number.isInteger(inference.maximumDegree) || inference.maximumDegree < 0) {
    throw new Error('inference.maximumDegree must be a non-negative integer');
  }
  if (!Number.isFinite(inference.minimumScore) || inference.minimumScore < 0) {
    throw new Error('inference.minimumScore must be a non-negative number');
  }

  const posts: PostSummary[] = input.posts
    .filter((post) => input.visibility === 'all' || post.status === 'published')
    .slice()
    .sort((left, right) => left.order - right.order || compareStrings(left.slug, right.slug));
  const visiblePostSlugs = new Set(posts.map((post) => post.slug));
  const usedThemeIds = new Set<ThemeId>();
  const usedConceptIds = new Set<ConceptId>();

  for (const post of posts) {
    usedThemeIds.add(post.themes.primary);
    for (const themeId of post.themes.secondary ?? []) usedThemeIds.add(themeId);
    for (const conceptId of post.conceptIds) usedConceptIds.add(conceptId);
  }

  const themes = input.taxonomy.themes
    .filter((theme) => usedThemeIds.has(theme.id))
    .slice()
    .sort((left, right) => left.order - right.order || compareStrings(left.id, right.id));
  const concepts = input.taxonomy.concepts
    .filter((concept) => usedConceptIds.has(concept.id))
    .slice()
    .sort((left, right) => compareStrings(left.label, right.label) || compareStrings(left.id, right.id));
  const themeById = new Map(themes.map((theme) => [theme.id, theme]));
  const conceptById = new Map(concepts.map((concept) => [concept.id, concept]));

  const nodes: ContentNode[] = [
    ...themes.map(
      (theme): ContentNode => ({ kind: 'theme', id: themeNodeId(theme.id), theme }),
    ),
    ...posts.map((post): ContentNode => ({ kind: 'post', id: postNodeId(post.slug), post })),
    ...concepts.map(
      (concept): ContentNode => ({ kind: 'concept', id: conceptNodeId(concept.id), concept }),
    ),
  ];
  const edges: ContentEdge[] = [];
  const postPairsWithAuthoredEvidence = new Set<string>();
  const authoredEdgeKeys = new Set<string>();

  for (const post of posts) {
    const primaryTheme = themeById.get(post.themes.primary);
    if (primaryTheme) {
      edges.push({
        id: `theme:${post.slug}:${primaryTheme.id}`,
        from: postNodeId(post.slug),
        to: themeNodeId(primaryTheme.id),
        kind: 'theme-membership',
        directed: true,
        provenance: 'authored',
        reason: `Primary editorial theme: ${primaryTheme.title}.`,
        rank: 0,
      });
    }

    for (const [index, themeId] of (post.themes.secondary ?? []).entries()) {
      const theme = themeById.get(themeId);
      if (!theme) continue;
      edges.push({
        id: `theme:${post.slug}:${theme.id}`,
        from: postNodeId(post.slug),
        to: themeNodeId(theme.id),
        kind: 'theme-membership',
        directed: true,
        provenance: 'authored',
        reason: `Secondary editorial theme: ${theme.title}.`,
        rank: index + 1,
      });
    }

    for (const [index, conceptId] of post.conceptIds.entries()) {
      const concept = conceptById.get(conceptId);
      if (!concept) continue;
      edges.push({
        id: `concept:${post.slug}:${concept.id}`,
        from: postNodeId(post.slug),
        to: conceptNodeId(concept.id),
        kind: 'concept-membership',
        directed: true,
        provenance: 'authored',
        reason: `Explores ${concept.label}.`,
        rank: index,
      });
    }

    for (const [index, relation] of post.relations.entries()) {
      if (!visiblePostSlugs.has(relation.to)) continue;
      const undirected = UNDIRECTED_AUTHORED_KINDS.has(relation.kind);
      const edgeKey = undirected
        ? `${relation.kind}:${canonicalPostPair(post.slug, relation.to)}`
        : `${relation.kind}:${post.slug}:${relation.to}`;
      if (authoredEdgeKeys.has(edgeKey)) continue;
      authoredEdgeKeys.add(edgeKey);
      postPairsWithAuthoredEvidence.add(canonicalPostPair(post.slug, relation.to));
      edges.push({
        id: `authored:${edgeKey}`,
        from: postNodeId(post.slug),
        to: postNodeId(relation.to),
        kind: relation.kind,
        directed: !undirected,
        provenance: 'authored',
        reason: relation.reason.trim(),
        rank: index,
      });
    }
  }

  const bodyLinkKeys = new Set<string>();
  for (const sourceSlug of [...visiblePostSlugs].sort(compareStrings)) {
    const targets = [...new Set(input.bodyLinks?.[sourceSlug] ?? [])].sort(compareStrings);
    for (const targetSlug of targets) {
      if (sourceSlug === targetSlug || !visiblePostSlugs.has(targetSlug)) continue;
      const edgeKey = `${sourceSlug}:${targetSlug}`;
      if (bodyLinkKeys.has(edgeKey)) continue;
      bodyLinkKeys.add(edgeKey);
      postPairsWithAuthoredEvidence.add(canonicalPostPair(sourceSlug, targetSlug));
      const targetTitle = input.posts.find((post) => post.slug === targetSlug)?.title ?? targetSlug;
      edges.push({
        id: `body-link:${edgeKey}`,
        from: postNodeId(sourceSlug),
        to: postNodeId(targetSlug),
        kind: 'mentions',
        directed: true,
        provenance: 'body-link',
        reason: `Links to “${targetTitle}” in the essay.`,
      });
    }
  }

  const inferredDegree = new Map<PostSlug, number>();
  const candidates = buildInferenceCandidates(
    posts,
    input.taxonomy,
    postPairsWithAuthoredEvidence,
    inference.minimumScore,
  );
  for (const candidate of candidates) {
    const fromDegree = inferredDegree.get(candidate.fromSlug) ?? 0;
    const toDegree = inferredDegree.get(candidate.toSlug) ?? 0;
    if (fromDegree >= inference.maximumDegree || toDegree >= inference.maximumDegree) continue;
    inferredDegree.set(candidate.fromSlug, fromDegree + 1);
    inferredDegree.set(candidate.toSlug, toDegree + 1);
    edges.push({
      id: `inferred:${candidate.fromSlug}:${candidate.toSlug}`,
      from: postNodeId(candidate.fromSlug),
      to: postNodeId(candidate.toSlug),
      kind: 'similar',
      directed: false,
      provenance: 'inferred',
      reason: candidate.reason,
      score: candidate.score,
    });
  }

  edges.sort(compareEdges);
  const nodeById = new Map<ContentNodeId, ContentNode>(nodes.map((node) => [node.id, node]));
  const adjacency = new Map<ContentNodeId, ContentEdge[]>(
    nodes.map((node) => [node.id, [] as ContentEdge[]]),
  );
  for (const edge of edges) {
    adjacency.get(edge.from)?.push(edge);
    if (edge.to !== edge.from) adjacency.get(edge.to)?.push(edge);
  }
  for (const incidentEdges of adjacency.values()) incidentEdges.sort(compareEdges);

  return {
    nodes,
    edges,
    nodeById,
    adjacency,
    postBySlug: new Map(posts.map((post) => [post.slug, post])),
    visiblePostSlugs,
  };
}

export const contentNodeIds = {
  post: postNodeId,
  theme: themeNodeId,
  concept: conceptNodeId,
};
