import { createHash } from 'crypto';
import type { Knex } from 'knex';
import type {
  AuthoredPostRelation,
  AuthoredRelationKind,
  ConceptDefinition,
  ContentTaxonomy,
  EditorialTheme,
  LoadedPost,
  PostArchivePayload,
  PostGraphLayout,
  PostSummary,
  ThemeTone,
} from '@shared/posts';
import { db } from '../db/connection';
import PostModel, {
  type ConceptAssignmentRow,
  type PostSummaryRow,
  type RelationRow,
  type ThemeAssignmentRow,
} from '../models/Post';

const isoString = (value: Date | string | null): string | undefined =>
  value ? new Date(value).toISOString() : undefined;

const stringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  if (typeof value !== 'string') return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
};

function fingerprint(nodes: PostGraphLayout['nodes']): `sha256:${string}` {
  return `sha256:${createHash('sha256').update(JSON.stringify(nodes)).digest('hex')}`;
}

interface ArchiveAssembly {
  posts: readonly PostSummary[];
  taxonomy: ContentTaxonomy;
  bodyLinksBySlug: PostArchivePayload['bodyLinksBySlug'];
  graphLayout: PostGraphLayout;
}

class PostServiceClass {
  private async assemble(
    rows: readonly PostSummaryRow[],
    trx: Knex.Transaction,
    includeDrafts: boolean,
  ): Promise<ArchiveAssembly> {
    const postIds = rows.map((row) => row.id);
    const [themeAssignments, conceptAssignments, relations, bodyLinks, graphMeta] =
      await Promise.all([
        PostModel.getThemeAssignments(postIds, trx),
        PostModel.getConceptAssignments(postIds, trx),
        PostModel.getRelations(postIds, trx),
        PostModel.getBodyLinks(postIds, trx),
        PostModel.getGraphLayoutMeta(trx),
      ]);

    const usedThemeIds = [...new Set(themeAssignments.map((assignment) => assignment.theme_id))];
    const usedConceptIds = [
      ...new Set(conceptAssignments.map((assignment) => assignment.concept_id)),
    ];
    const [themeRows, conceptRows] = await Promise.all([
      PostModel.getThemes(usedThemeIds, trx),
      PostModel.getConcepts(usedConceptIds, trx),
    ]);

    const rowById = new Map(rows.map((row) => [row.id, row]));
    const themesByPost = new Map<number, ThemeAssignmentRow[]>();
    const conceptsByPost = new Map<number, ConceptAssignmentRow[]>();
    const relationsByPost = new Map<number, RelationRow[]>();

    themeAssignments.forEach((assignment) => {
      const current = themesByPost.get(assignment.post_id) ?? [];
      current.push(assignment);
      themesByPost.set(assignment.post_id, current);
    });
    conceptAssignments.forEach((assignment) => {
      const current = conceptsByPost.get(assignment.post_id) ?? [];
      current.push(assignment);
      conceptsByPost.set(assignment.post_id, current);
    });
    relations.forEach((relation) => {
      const current = relationsByPost.get(relation.from_post_id) ?? [];
      current.push(relation);
      relationsByPost.set(relation.from_post_id, current);
    });

    const posts = rows.map((row, visibleIndex): PostSummary => {
      const assignedThemes = themesByPost.get(row.id) ?? [];
      const primary = assignedThemes.find((assignment) => assignment.role === 'primary');
      if (!primary) throw new Error(`Post ${row.slug} has no primary theme`);

      const authoredRelations = (relationsByPost.get(row.id) ?? []).flatMap(
        (relation): AuthoredPostRelation[] => {
          const target = rowById.get(relation.to_post_id);
          return target
            ? [
                {
                  to: target.slug,
                  kind: relation.kind as AuthoredRelationKind,
                  reason: relation.reason,
                },
              ]
            : [];
        },
      );

      return {
        slug: row.slug,
        title: row.title,
        dek: row.dek,
        status: row.status,
        sourcePeriod: row.source_period,
        publishedAt: isoString(row.published_at),
        updatedAt: isoString(row.editorial_updated_at),
        socialImage: row.social_image_url ?? undefined,
        featured: row.featured || undefined,
        order: includeDrafts ? row.display_order : visibleIndex + 1,
        themes: {
          primary: primary.theme_id,
          secondary: assignedThemes
            .filter((assignment) => assignment.role === 'secondary')
            .map((assignment) => assignment.theme_id),
        },
        conceptIds: (conceptsByPost.get(row.id) ?? []).map(
          (assignment) => assignment.concept_id,
        ),
        relations: authoredRelations,
        wordCount: row.word_count,
        readingMinutes: row.reading_minutes,
      };
    });

    const themes: EditorialTheme[] = themeRows.map((theme) => ({
      id: theme.id,
      title: theme.title,
      description: theme.description,
      order: theme.display_order,
      tone: theme.tone as ThemeTone,
      anchor: { x: Number(theme.anchor_x), y: Number(theme.anchor_y) },
      ...(theme.label_offset_x !== null && theme.label_offset_y !== null
        ? {
            labelOffset: {
              x: Number(theme.label_offset_x),
              y: Number(theme.label_offset_y),
            },
          }
        : {}),
    }));
    const concepts: ConceptDefinition[] = conceptRows.map((concept) => ({
      id: concept.id,
      label: concept.label,
      aliases: stringArray(concept.aliases),
    }));

    const bodyLinksBySlug: Record<string, string[]> = Object.fromEntries(
      rows.map((row) => [row.slug, []]),
    );
    bodyLinks.forEach((link) => {
      const source = rowById.get(link.from_post_id);
      const target = rowById.get(link.to_post_id);
      if (source && target) bodyLinksBySlug[source.slug].push(target.slug);
    });

    const nodes: PostGraphLayout['nodes'] = Object.fromEntries([
      ...rows.flatMap((row) =>
        row.graph_x === null || row.graph_y === null
          ? []
          : [[`post:${row.slug}`, { x: Number(row.graph_x), y: Number(row.graph_y) }] as const],
      ),
      ...themes.map((theme) => [`theme:${theme.id}`, theme.anchor] as const),
    ]);
    const sourceFingerprint = fingerprint(nodes);

    return {
      posts,
      taxonomy: { version: 1, themes, concepts },
      bodyLinksBySlug,
      graphLayout: {
        version: 1,
        algorithmVersion: graphMeta?.algorithm_version ?? 'database-authored-v1',
        sourceFingerprint,
        coordinateSpace: 'normalized',
        minimumDistance: Number(graphMeta?.minimum_distance ?? 0.055),
        nodes,
      },
    };
  }

  async getArchive(includeDrafts: boolean): Promise<PostArchivePayload> {
    return db.transaction(
      async (trx) => {
        const rows = await PostModel.getSummaries(includeDrafts, trx);
        const archive = await this.assemble(rows, trx, includeDrafts);
        return {
          version: 1,
          visibility: includeDrafts ? 'preview' : 'published',
          ...archive,
        } as const;
      },
      { isolationLevel: 'repeatable read', readOnly: true },
    );
  }

  async getBySlug(slug: string, includeDrafts: boolean): Promise<LoadedPost | null> {
    return db.transaction(
      async (trx) => {
        const row = await PostModel.getBySlug(slug, includeDrafts, trx);
        if (!row) return null;

        const rows = await PostModel.getSummaries(includeDrafts, trx);
        const archive = await this.assemble(rows, trx, includeDrafts);
        const summary = archive.posts.find((post) => post.slug === row.slug);
        if (!summary) return null;

        return { ...summary, body: row.body_markdown };
      },
      { isolationLevel: 'repeatable read', readOnly: true },
    );
  }
}

export const PostService = new PostServiceClass();
export default PostService;
