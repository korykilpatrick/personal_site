import type {
  ContentEdge,
  ContentGraph,
  ContentNode,
  ContentNodeId,
  EdgeProvenance,
  PostSlug,
  PostSummary,
} from '../types';
import { contentNodeIds } from './compileContentGraph';

export type RelatedPostDirection = 'outgoing' | 'incoming' | 'undirected';

export interface RelatedPostResult {
  post: PostSummary;
  edge: ContentEdge;
  direction: RelatedPostDirection;
  reason: string;
  relevance: number;
}

export interface RelatedPostOptions {
  includeInferred?: boolean;
  limit?: number;
}

const PROVENANCE_WEIGHT: Record<EdgeProvenance, number> = {
  authored: 3000,
  'body-link': 2000,
  inferred: 1000,
};

const POST_TO_POST_KINDS = new Set<ContentEdge['kind']>([
  'related',
  'continues',
  'contrasts',
  'applies',
  'echoes',
  'origin',
  'mentions',
  'similar',
]);

function otherNodeId(edge: ContentEdge, nodeId: ContentNodeId): ContentNodeId | null {
  if (edge.from === nodeId) return edge.to;
  if (edge.to === nodeId) return edge.from;
  return null;
}

function relationDirection(edge: ContentEdge, nodeId: ContentNodeId): RelatedPostDirection {
  if (!edge.directed) return 'undirected';
  return edge.from === nodeId ? 'outgoing' : 'incoming';
}

function relevanceFor(edge: ContentEdge, direction: RelatedPostDirection): number {
  const authoredOrderBonus = edge.rank === undefined ? 0 : Math.max(0, 100 - edge.rank * 10);
  const directionBonus = direction === 'outgoing' ? 25 : 0;
  return PROVENANCE_WEIGHT[edge.provenance] + authoredOrderBonus + directionBonus + (edge.score ?? 0);
}

export function getRelatedPosts(
  graph: ContentGraph,
  slug: PostSlug,
  options: RelatedPostOptions = {},
): RelatedPostResult[] {
  const nodeId = contentNodeIds.post(slug);
  if (!graph.nodeById.has(nodeId)) return [];

  const includeInferred = options.includeInferred ?? true;
  const requestedLimit = options.limit ?? 3;
  const limit = Number.isFinite(requestedLimit) ? Math.max(0, Math.floor(requestedLimit)) : 3;
  const bestBySlug = new Map<PostSlug, RelatedPostResult>();

  for (const edge of graph.adjacency.get(nodeId) ?? []) {
    if (!POST_TO_POST_KINDS.has(edge.kind)) continue;
    if (!includeInferred && edge.provenance === 'inferred') continue;

    const neighborId = otherNodeId(edge, nodeId);
    if (!neighborId?.startsWith('post:')) continue;
    const neighborSlug = neighborId.slice('post:'.length);
    const post = graph.postBySlug.get(neighborSlug);
    if (!post) continue;

    const direction = relationDirection(edge, nodeId);
    const result: RelatedPostResult = {
      post,
      edge,
      direction,
      reason: edge.reason,
      relevance: relevanceFor(edge, direction),
    };
    const existing = bestBySlug.get(neighborSlug);
    if (!existing || result.relevance > existing.relevance) {
      bestBySlug.set(neighborSlug, result);
    }
  }

  return [...bestBySlug.values()]
    .sort(
      (left, right) =>
        right.relevance - left.relevance ||
        left.post.order - right.post.order ||
        left.post.slug.localeCompare(right.post.slug),
    )
    .slice(0, limit);
}

export function getPostsForTheme(graph: ContentGraph, themeId: string): PostSummary[] {
  return [...graph.postBySlug.values()]
    .filter(
      (post) =>
        post.themes.primary === themeId || (post.themes.secondary ?? []).includes(themeId),
    )
    .sort(
      (left, right) =>
        Number(right.themes.primary === themeId) - Number(left.themes.primary === themeId) ||
        left.order - right.order ||
        left.slug.localeCompare(right.slug),
    );
}

export function getPostsForConcept(graph: ContentGraph, conceptId: string): PostSummary[] {
  return [...graph.postBySlug.values()]
    .filter((post) => post.conceptIds.includes(conceptId))
    .sort((left, right) => left.order - right.order || left.slug.localeCompare(right.slug));
}

export function getNeighborNodes(graph: ContentGraph, nodeId: ContentNodeId): ContentNode[] {
  const neighbors = new Map<ContentNodeId, ContentNode>();
  for (const edge of graph.adjacency.get(nodeId) ?? []) {
    const neighborId = otherNodeId(edge, nodeId);
    if (!neighborId) continue;
    const neighbor = graph.nodeById.get(neighborId);
    if (neighbor) neighbors.set(neighborId, neighbor);
  }
  return [...neighbors.values()];
}
