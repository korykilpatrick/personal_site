import { compileContentGraph } from './graph/compileContentGraph';
import type {
  ContentGraph,
  ContentTaxonomy,
  PostArchivePayload,
  PostGraphLayout,
  PostSummary,
} from './types';

export interface PostArchiveModel {
  posts: readonly PostSummary[];
  taxonomy: ContentTaxonomy;
  graphLayout: PostGraphLayout;
  bodyLinksBySlug: PostArchivePayload['bodyLinksBySlug'];
  contentGraph: ContentGraph;
  postBySlug: ReadonlyMap<string, PostSummary>;
  visibility: PostArchivePayload['visibility'];
}

export function createPostArchiveModel(payload: PostArchivePayload): PostArchiveModel {
  const posts = [...payload.posts].sort(
    (left, right) => left.order - right.order || left.slug.localeCompare(right.slug),
  );
  const contentGraph = compileContentGraph({
    posts,
    taxonomy: payload.taxonomy,
    visibility: payload.visibility === 'preview' ? 'all' : 'published',
    bodyLinks: payload.bodyLinksBySlug,
  });

  return {
    posts,
    taxonomy: payload.taxonomy,
    graphLayout: payload.graphLayout,
    bodyLinksBySlug: payload.bodyLinksBySlug,
    contentGraph,
    postBySlug: new Map(posts.map((post) => [post.slug, post])),
    visibility: payload.visibility,
  };
}

export type {
  ContentGraph,
  ContentTaxonomy,
  LoadedPost,
  PostArchivePayload,
  PostGraphLayout,
  PostSlug,
  PostStatus,
  PostSummary,
} from './types';
