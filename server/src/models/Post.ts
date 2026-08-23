import { db } from '../db/connection';
import type { Knex } from 'knex';

export interface PostSummaryRow {
  id: number;
  slug: string;
  title: string;
  dek: string;
  status: 'draft' | 'published';
  source_period: string;
  published_at: Date | string | null;
  social_image_url: string | null;
  featured: boolean;
  display_order: number;
  word_count: number;
  reading_minutes: number;
  graph_x: number | null;
  graph_y: number | null;
  editorial_updated_at: Date | string | null;
}

export interface LoadedPostRow extends PostSummaryRow {
  body_markdown: string;
}

export interface ThemeRow {
  id: string;
  title: string;
  description: string;
  display_order: number;
  tone: string;
  anchor_x: number;
  anchor_y: number;
  label_offset_x: number | null;
  label_offset_y: number | null;
}

export interface ConceptRow {
  id: string;
  label: string;
  aliases: unknown;
}

export interface ThemeAssignmentRow {
  post_id: number;
  theme_id: string;
  role: 'primary' | 'secondary';
  display_order: number;
}

export interface ConceptAssignmentRow {
  post_id: number;
  concept_id: string;
  display_order: number;
}

export interface RelationRow {
  from_post_id: number;
  to_post_id: number;
  kind: string;
  reason: string;
  display_order: number;
}

export interface BodyLinkRow {
  from_post_id: number;
  to_post_id: number;
}

export interface GraphLayoutMetaRow {
  algorithm_version: string;
  source_fingerprint: string;
  minimum_distance: number;
}

const SUMMARY_COLUMNS = [
  'id',
  'slug',
  'title',
  'dek',
  'status',
  'source_period',
  'published_at',
  'social_image_url',
  'featured',
  'display_order',
  'word_count',
  'reading_minutes',
  'graph_x',
  'graph_y',
  'editorial_updated_at',
] as const;

class PostModelClass {
  private applyActiveVisibility(query: Knex.QueryBuilder): void {
    query.where('is_active', true);
  }

  private applyPublicVisibility(query: Knex.QueryBuilder): void {
    query
      .where('status', 'published')
      .whereNotNull('published_at')
      .where('published_at', '<=', db.fn.now());
  }

  async getSummaries(
    includeDrafts: boolean,
    trx?: Knex.Transaction,
  ): Promise<PostSummaryRow[]> {
    const query = (trx ?? db)<PostSummaryRow>('posts')
      .select(...SUMMARY_COLUMNS)
      .orderBy('display_order', 'asc');
    this.applyActiveVisibility(query);
    if (!includeDrafts) this.applyPublicVisibility(query);
    return query;
  }

  async getBySlug(
    slug: string,
    includeDrafts: boolean,
    trx?: Knex.Transaction,
  ): Promise<LoadedPostRow | null> {
    const query = (trx ?? db)<LoadedPostRow>('posts')
      .select([...SUMMARY_COLUMNS, 'body_markdown'])
      .where({ slug });
    this.applyActiveVisibility(query);
    if (!includeDrafts) this.applyPublicVisibility(query);
    return (await query.first()) ?? null;
  }

  async getThemeAssignments(
    postIds: readonly number[],
    trx?: Knex.Transaction,
  ): Promise<ThemeAssignmentRow[]> {
    if (postIds.length === 0) return [];
    return (trx ?? db)<ThemeAssignmentRow>('post_theme_assignments')
      .select('post_id', 'theme_id', 'role', 'display_order')
      .whereIn('post_id', postIds)
      .orderBy([{ column: 'post_id' }, { column: 'display_order' }]);
  }

  async getConceptAssignments(
    postIds: readonly number[],
    trx?: Knex.Transaction,
  ): Promise<ConceptAssignmentRow[]> {
    if (postIds.length === 0) return [];
    return (trx ?? db)<ConceptAssignmentRow>('post_concept_assignments')
      .select('post_id', 'concept_id', 'display_order')
      .whereIn('post_id', postIds)
      .orderBy([{ column: 'post_id' }, { column: 'display_order' }]);
  }

  async getRelations(postIds: readonly number[], trx?: Knex.Transaction): Promise<RelationRow[]> {
    if (postIds.length === 0) return [];
    return (trx ?? db)<RelationRow>('post_relations')
      .select('from_post_id', 'to_post_id', 'kind', 'reason', 'display_order')
      .whereIn('from_post_id', postIds)
      .whereIn('to_post_id', postIds)
      .orderBy([{ column: 'from_post_id' }, { column: 'display_order' }]);
  }

  async getBodyLinks(postIds: readonly number[], trx?: Knex.Transaction): Promise<BodyLinkRow[]> {
    if (postIds.length === 0) return [];
    return (trx ?? db)<BodyLinkRow>('post_body_links')
      .select('from_post_id', 'to_post_id')
      .whereIn('from_post_id', postIds)
      .whereIn('to_post_id', postIds)
      .orderBy([{ column: 'from_post_id' }, { column: 'to_post_id' }]);
  }

  async getThemes(themeIds: readonly string[], trx?: Knex.Transaction): Promise<ThemeRow[]> {
    if (themeIds.length === 0) return [];
    return (trx ?? db)<ThemeRow>('post_themes')
      .select(
        'id',
        'title',
        'description',
        'display_order',
        'tone',
        'anchor_x',
        'anchor_y',
        'label_offset_x',
        'label_offset_y',
      )
      .whereIn('id', themeIds)
      .orderBy('display_order', 'asc');
  }

  async getConcepts(conceptIds: readonly string[], trx?: Knex.Transaction): Promise<ConceptRow[]> {
    if (conceptIds.length === 0) return [];
    return (trx ?? db)<ConceptRow>('post_concepts')
      .select('id', 'label', 'aliases')
      .whereIn('id', conceptIds)
      .orderBy('label', 'asc');
  }

  async getGraphLayoutMeta(trx?: Knex.Transaction): Promise<GraphLayoutMetaRow | null> {
    return (
      (await (trx ?? db)<GraphLayoutMetaRow>('post_graph_layout_meta')
        .select('algorithm_version', 'source_fingerprint', 'minimum_distance')
        .whereRaw('id = ?', [1])
        .first()) ?? null
    );
  }
}

export const PostModel = new PostModelClass();
export default PostModel;
