export type PostStatus = 'draft' | 'published';
export type PostSlug = string;
export type ThemeId = string;
export type ConceptId = string;

export interface GraphPoint {
  x: number;
  y: number;
}

export type ThemeTone =
  | 'navy'
  | 'oxblood'
  | 'walnut'
  | 'old-gold'
  | 'sage'
  | 'plum'
  | 'rust'
  | 'slate';

export interface EditorialTheme {
  id: ThemeId;
  title: string;
  description: string;
  order: number;
  anchor: GraphPoint;
  labelOffset?: GraphPoint;
  tone: ThemeTone;
}

export interface ConceptDefinition {
  id: ConceptId;
  label: string;
  aliases?: readonly string[];
}

export interface ContentTaxonomy {
  version: 1;
  themes: readonly EditorialTheme[];
  concepts: readonly ConceptDefinition[];
}

export interface PostThemeAssignments {
  primary: ThemeId;
  secondary?: readonly ThemeId[];
}

export type AuthoredRelationKind =
  | 'related'
  | 'continues'
  | 'contrasts'
  | 'applies'
  | 'echoes'
  | 'origin';

export interface AuthoredPostRelation {
  to: PostSlug;
  kind: AuthoredRelationKind;
  reason: string;
}

export interface PostSummary {
  slug: PostSlug;
  title: string;
  dek: string;
  status: PostStatus;
  sourcePeriod: string;
  publishedAt?: string;
  updatedAt?: string;
  socialImage?: string;
  featured?: boolean;
  order: number;
  themes: PostThemeAssignments;
  conceptIds: readonly ConceptId[];
  relations: readonly AuthoredPostRelation[];
  wordCount: number;
  readingMinutes: number;
}

export interface LoadedPost extends PostSummary {
  body: string;
}

export type PostNodeId = `post:${string}`;
export type ThemeNodeId = `theme:${string}`;
export type ConceptNodeId = `concept:${string}`;
export type ContentNodeId = PostNodeId | ThemeNodeId | ConceptNodeId;

export interface PostContentNode {
  kind: 'post';
  id: PostNodeId;
  post: PostSummary;
}

export interface ThemeContentNode {
  kind: 'theme';
  id: ThemeNodeId;
  theme: EditorialTheme;
}

export interface ConceptContentNode {
  kind: 'concept';
  id: ConceptNodeId;
  concept: ConceptDefinition;
}

export type ContentNode = PostContentNode | ThemeContentNode | ConceptContentNode;
export type EdgeProvenance = 'authored' | 'body-link' | 'inferred';

export type ContentEdgeKind =
  | 'theme-membership'
  | 'concept-membership'
  | AuthoredRelationKind
  | 'mentions'
  | 'similar';

export interface ContentEdge {
  id: string;
  from: ContentNodeId;
  to: ContentNodeId;
  kind: ContentEdgeKind;
  directed: boolean;
  provenance: EdgeProvenance;
  reason: string;
  rank?: number;
  score?: number;
}

export interface ContentGraph {
  nodes: readonly ContentNode[];
  edges: readonly ContentEdge[];
  nodeById: ReadonlyMap<ContentNodeId, ContentNode>;
  adjacency: ReadonlyMap<ContentNodeId, readonly ContentEdge[]>;
  postBySlug: ReadonlyMap<PostSlug, PostSummary>;
  visiblePostSlugs: ReadonlySet<PostSlug>;
}

export type GraphLayoutNodeId = PostNodeId | ThemeNodeId;

export interface PostGraphLayout {
  version: 1;
  algorithmVersion: string;
  sourceFingerprint: `sha256:${string}`;
  coordinateSpace: 'normalized';
  minimumDistance: number;
  nodes: Readonly<Partial<Record<GraphLayoutNodeId, GraphPoint>>>;
}

export interface PostArchivePayload {
  version: 1;
  visibility: 'published' | 'preview';
  posts: readonly PostSummary[];
  taxonomy: ContentTaxonomy;
  bodyLinksBySlug: Readonly<Record<PostSlug, readonly PostSlug[]>>;
  graphLayout: PostGraphLayout;
}
