/* eslint-disable no-console -- This file is an interactive command-line importer. */
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import config from '../config/config';
import { db } from '../db/connection';

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const nonBlankSchema = z.string().trim().min(1);
const pointSchema = z.object({
  x: z.number().finite().min(0).max(1),
  y: z.number().finite().min(0).max(1),
}).strict();
const offsetPointSchema = z.object({
  x: z.number().finite().min(-0.5).max(0.5),
  y: z.number().finite().min(-0.5).max(0.5),
}).strict();
const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
  }, 'must be a real YYYY-MM-DD date');
const relationKindSchema = z.enum([
  'related',
  'continues',
  'contrasts',
  'applies',
  'echoes',
  'origin',
]);
const privatePostSchema = z
  .object({
    slug: slugSchema.refine((value) => value !== 'archive', 'archive is a reserved post slug'),
    title: nonBlankSchema,
    dek: nonBlankSchema,
    status: z.enum(['draft', 'published']),
    sourcePeriod: nonBlankSchema,
    publishedAt: dateOnlySchema.optional(),
    updatedAt: dateOnlySchema.optional(),
    socialImage: z.string().url().refine((value) => value.startsWith('https://')).optional(),
    featured: z.boolean().optional(),
    order: z.number().int().positive(),
    themes: z
      .object({
        primary: slugSchema,
        secondary: z.array(slugSchema).optional(),
      })
      .strict(),
    conceptIds: z.array(slugSchema),
    relations: z.array(
      z
        .object({
          to: slugSchema,
          kind: relationKindSchema,
          reason: nonBlankSchema,
        })
        .strict(),
    ),
  })
  .strict()
  .superRefine((post, context) => {
    if (post.status === 'published' && !post.publishedAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['publishedAt'],
        message: 'published posts require a publication date',
      });
    }
  });
const privateManifestSchema = z
  .object({ version: z.literal(2), posts: z.array(privatePostSchema).min(1) })
  .strict();
const privateTaxonomySchema = z
  .object({
    version: z.literal(1),
    themes: z
      .array(
        z
          .object({
            id: slugSchema,
            title: nonBlankSchema,
            description: nonBlankSchema,
            order: z.number().int().positive(),
            tone: z.enum([
              'navy',
              'oxblood',
              'walnut',
              'old-gold',
              'sage',
              'plum',
              'rust',
              'slate',
            ]),
            anchor: pointSchema,
            labelOffset: offsetPointSchema.optional(),
          })
          .strict(),
      )
      .min(1),
    concepts: z
      .array(
        z
          .object({
            id: slugSchema,
            label: nonBlankSchema,
            aliases: z.array(nonBlankSchema).optional(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();
const privateGraphLayoutSchema = z
  .object({
    version: z.literal(1),
    algorithmVersion: nonBlankSchema,
    sourceFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    coordinateSpace: z.literal('normalized'),
    minimumDistance: z.number().finite().gt(0).lt(1),
    nodes: z.record(pointSchema),
  })
  .strict();

type PrivateManifest = z.infer<typeof privateManifestSchema>;
type PrivateTaxonomy = z.infer<typeof privateTaxonomySchema>;
type PrivateGraphLayout = z.infer<typeof privateGraphLayoutSchema>;

interface ValidatedSource {
  manifest: PrivateManifest;
  taxonomy: PrivateTaxonomy;
  graphLayout: PrivateGraphLayout;
  bodies: Map<string, string>;
  bodyLinks: Map<string, string[]>;
}

const POST_LINK_PATTERN =
  /(?:(?:https?:)?\/\/(?:www\.)?korykilpatrick\.com(?::443)?\/posts\/|(?<![A-Za-z0-9.])\/posts\/)([a-z0-9]+(?:-[a-z0-9]+)*)(?=[/?#)"'<\s]|$)/gi;
const POST_LINK_COMPONENT_PATTERN =
  /<PostLink\b[^>]*\bslug\s*=\s*(?:"([a-z0-9]+(?:-[a-z0-9]+)*)"|'([a-z0-9]+(?:-[a-z0-9]+)*)'|([a-z0-9]+(?:-[a-z0-9]+)*))[^>]*>/gi;
const WORD_PATTERN = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
const ALLOWED_COMPONENTS = new Set([
  'Figure',
  'Footnote',
  'PostLink',
  'PullQuote',
  'Tweet',
  'Video',
  'YouTube',
]);

function readJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown;
}

function extractBodyLinks(markdown: string): string[] {
  const slugs = new Set<string>();
  for (const match of markdown.matchAll(POST_LINK_PATTERN)) slugs.add(match[1]);
  for (const match of markdown.matchAll(POST_LINK_COMPONENT_PATTERN)) {
    slugs.add(match[1] ?? match[2] ?? match[3]);
  }
  return [...slugs].sort();
}

function countWords(markdown: string): number {
  const text = markdown
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_>#~|=-]/g, ' ');
  return text.match(WORD_PATTERN)?.length ?? 0;
}

function assertPoint(point: { x: number; y: number } | undefined, label: string): void {
  if (
    !point ||
    !Number.isFinite(point.x) ||
    !Number.isFinite(point.y) ||
    point.x < 0 ||
    point.x > 1 ||
    point.y < 0 ||
    point.y > 1
  ) {
    throw new Error(`${label} must be a normalized x/y point`);
  }
}

function assertUnique(values: readonly (string | number)[], label: string): void {
  if (new Set(values).size !== values.length) {
    throw new Error(`${label} must be unique`);
  }
}

function assertSafeMarkup(markdown: string, slug: string): void {
  const outsideCode = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]*`/g, '');
  const tagPattern = /<\/?([A-Za-z][A-Za-z0-9]*)(?=[\s/>])[^>]*>/g;
  for (const match of outsideCode.matchAll(tagPattern)) {
    const tagName = match[1];
    const tag = match[0];
    if (!ALLOWED_COMPONENTS.has(tagName)) {
      throw new Error(`${slug}: raw HTML tag <${tagName}> is not allowed`);
    }
    if (/\s(?:on[a-z]+|style|dangerouslySetInnerHTML)\s*=/i.test(tag)) {
      throw new Error(`${slug}: unsafe component attribute on <${tagName}>`);
    }
    if (/\b(?:javascript|data|vbscript)\s*:/i.test(tag)) {
      throw new Error(`${slug}: unsafe URL protocol on <${tagName}>`);
    }
  }
  if (/\]\(\s*<?\s*(?:javascript|data|vbscript)\s*:/i.test(outsideCode)) {
    throw new Error(`${slug}: unsafe Markdown link protocol`);
  }
  for (const match of outsideCode.matchAll(/!\[[^\]]*\]\(\s*<?([^>\s)]+)/g)) {
    if (!match[1].startsWith('https://')) {
      throw new Error(`${slug}: post images must use private HTTPS media URLs`);
    }
  }
}

export function loadAndValidateSource(sourceDirectory: string): ValidatedSource {
  const manifest = privateManifestSchema.parse(
    readJson(path.join(sourceDirectory, 'manifest.json')),
  );
  const taxonomy = privateTaxonomySchema.parse(
    readJson(path.join(sourceDirectory, 'taxonomy.json')),
  );
  const graphLayout = privateGraphLayoutSchema.parse(
    readJson(path.join(sourceDirectory, 'graph-layout.json')),
  );

  assertUnique(manifest.posts.map((post) => post.slug), 'Post slugs');
  assertUnique(manifest.posts.map((post) => post.order), 'Post display orders');
  assertUnique(taxonomy.themes.map((theme) => theme.id), 'Theme IDs');
  assertUnique(taxonomy.themes.map((theme) => theme.order), 'Theme display orders');
  assertUnique(taxonomy.concepts.map((concept) => concept.id), 'Concept IDs');
  taxonomy.concepts.forEach((concept) =>
    assertUnique(concept.aliases ?? [], `Concept ${concept.id} aliases`),
  );

  const postSlugs = new Set(manifest.posts.map((post) => post.slug));
  const postBySlug = new Map(manifest.posts.map((post) => [post.slug, post]));
  const themeIds = new Set(taxonomy.themes.map((theme) => theme.id));
  const conceptIds = new Set(taxonomy.concepts.map((concept) => concept.id));
  taxonomy.themes.forEach((theme) => assertPoint(theme.anchor, `Theme ${theme.id} anchor`));

  const bodies = new Map<string, string>();
  const bodyLinks = new Map<string, string[]>();

  manifest.posts.forEach((post) => {
    if (!themeIds.has(post.themes.primary)) {
      throw new Error(`${post.slug}: unknown primary theme ${post.themes.primary}`);
    }
    assertUnique(post.themes.secondary ?? [], `${post.slug} secondary themes`);
    for (const themeId of post.themes.secondary ?? []) {
      if (!themeIds.has(themeId) || themeId === post.themes.primary) {
        throw new Error(`${post.slug}: invalid secondary theme ${themeId}`);
      }
    }
    assertUnique(post.conceptIds, `${post.slug} concepts`);
    for (const conceptId of post.conceptIds) {
      if (!conceptIds.has(conceptId)) throw new Error(`${post.slug}: unknown concept ${conceptId}`);
    }
    assertUnique(
      post.relations.map((relation) => `${relation.to}:${relation.kind}`),
      `${post.slug} relationships`,
    );
    for (const relation of post.relations) {
      if (
        !postSlugs.has(relation.to) ||
        relation.to === post.slug
      ) {
        throw new Error(`${post.slug}: invalid relationship to ${relation.to}`);
      }
    }

    const bodyPath = path.join(sourceDirectory, `${post.slug}.md`);
    const body = fs.readFileSync(bodyPath, 'utf8');
    if (!body.trim()) throw new Error(`${post.slug}: Markdown body is empty`);
    assertSafeMarkup(body, post.slug);
    bodies.set(post.slug, body);

    const links = extractBodyLinks(body);
    links.forEach((target) => {
      if (!postSlugs.has(target) || target === post.slug) {
        throw new Error(`${post.slug}: invalid body link to ${target}`);
      }
    });
    if (post.status === 'published') {
      const sourcePublication = post.publishedAt as string;
      const referencedSlugs = [
        ...new Set([
          ...post.relations.map((relation) => relation.to),
          ...links,
        ]),
      ];
      referencedSlugs.forEach((targetSlug) => {
        const target = postBySlug.get(targetSlug);
        if (
          !target ||
          target.status !== 'published' ||
          !target.publishedAt ||
          target.publishedAt > sourcePublication
        ) {
          throw new Error(
            `${post.slug}: published copy cannot expose unpublished post ${targetSlug}`,
          );
        }
      });
    }
    bodyLinks.set(post.slug, links);
    assertPoint(graphLayout.nodes[`post:${post.slug}`], `Post ${post.slug} graph position`);
  });

  return { manifest, taxonomy, graphLayout, bodies, bodyLinks };
}

async function importSource(source: ValidatedSource): Promise<void> {
  await db.transaction(async (trx) => {
    for (const theme of source.taxonomy.themes) {
      await trx('post_themes')
        .insert({
          id: theme.id,
          title: theme.title,
          description: theme.description,
          display_order: theme.order,
          tone: theme.tone,
          anchor_x: theme.anchor.x,
          anchor_y: theme.anchor.y,
          label_offset_x: theme.labelOffset?.x ?? null,
          label_offset_y: theme.labelOffset?.y ?? null,
          updated_at: trx.fn.now(),
        })
        .onConflict('id')
        .merge();
    }

    for (const concept of source.taxonomy.concepts) {
      await trx('post_concepts')
        .insert({
          id: concept.id,
          label: concept.label,
          aliases: JSON.stringify(concept.aliases ?? []),
          updated_at: trx.fn.now(),
        })
        .onConflict('id')
        .merge();
    }

    await trx('post_graph_layout_meta')
      .insert({
        id: 1,
        algorithm_version: source.graphLayout.algorithmVersion,
        source_fingerprint: source.graphLayout.sourceFingerprint,
        minimum_distance: source.graphLayout.minimumDistance,
        updated_at: trx.fn.now(),
      })
      .onConflict('id')
      .merge();

    for (const post of source.manifest.posts) {
      const wordCount = countWords(source.bodies.get(post.slug) ?? '');
      const point = source.graphLayout.nodes[`post:${post.slug}`];
      await trx('posts')
        .insert({
          slug: post.slug,
          title: post.title,
          dek: post.dek,
          body_markdown: source.bodies.get(post.slug),
          status: post.status,
          source_period: post.sourcePeriod,
          published_at: post.publishedAt ? new Date(`${post.publishedAt}T00:00:00Z`) : null,
          social_image_url: post.socialImage ?? null,
          featured: Boolean(post.featured),
          is_active: true,
          display_order: post.order,
          word_count: wordCount,
          reading_minutes: Math.max(1, Math.ceil(wordCount / 220)),
          graph_x: point.x,
          graph_y: point.y,
          editorial_updated_at: post.updatedAt
            ? new Date(`${post.updatedAt}T00:00:00Z`)
            : null,
          updated_at: trx.fn.now(),
        })
        .onConflict('slug')
        .merge();
    }

    await trx('posts')
      .whereNotIn(
        'slug',
        source.manifest.posts.map((post) => post.slug),
      )
      .update({
        is_active: false,
        status: 'draft',
        published_at: null,
        updated_at: trx.fn.now(),
      });

    const rows = await trx('posts')
      .select('id', 'slug')
      .whereIn(
        'slug',
        source.manifest.posts.map((post) => post.slug),
      );
    const idBySlug = new Map<string, number>(
      rows.map((row: { id: number; slug: string }) => [row.slug, row.id]),
    );
    const postIds = [...idBySlug.values()];

    await trx('post_body_links').whereIn('from_post_id', postIds).delete();
    await trx('post_relations').whereIn('from_post_id', postIds).delete();
    await trx('post_concept_assignments').whereIn('post_id', postIds).delete();
    await trx('post_theme_assignments').whereIn('post_id', postIds).delete();

    const themeAssignments = source.manifest.posts.flatMap((post) => [
      {
        post_id: idBySlug.get(post.slug),
        theme_id: post.themes.primary,
        role: 'primary',
        display_order: 0,
      },
      ...(post.themes.secondary ?? []).map((themeId, index) => ({
        post_id: idBySlug.get(post.slug),
        theme_id: themeId,
        role: 'secondary',
        display_order: index + 1,
      })),
    ]);
    const conceptAssignments = source.manifest.posts.flatMap((post) =>
      post.conceptIds.map((conceptId, index) => ({
        post_id: idBySlug.get(post.slug),
        concept_id: conceptId,
        display_order: index,
      })),
    );
    const relations = source.manifest.posts.flatMap((post) =>
      post.relations.map((relation, index) => ({
        from_post_id: idBySlug.get(post.slug),
        to_post_id: idBySlug.get(relation.to),
        kind: relation.kind,
        reason: relation.reason,
        display_order: index,
      })),
    );
    const bodyLinks = source.manifest.posts.flatMap((post) =>
      (source.bodyLinks.get(post.slug) ?? []).map((target) => ({
        from_post_id: idBySlug.get(post.slug),
        to_post_id: idBySlug.get(target),
      })),
    );

    if (themeAssignments.length) await trx('post_theme_assignments').insert(themeAssignments);
    if (conceptAssignments.length) await trx('post_concept_assignments').insert(conceptAssignments);
    if (relations.length) await trx('post_relations').insert(relations);
    if (bodyLinks.length) await trx('post_body_links').insert(bodyLinks);
  });
}

function argumentValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function assertSafeImportTarget(): void {
  const localHosts = new Set(['127.0.0.1', 'localhost', '::1']);
  if (
    process.env.POSTS_IMPORT_TARGET !== 'local-preview' ||
    !localHosts.has(config.db.host) ||
    config.db.database !== 'personal_site_posts_preview'
  ) {
    throw new Error(
      'Post imports require POSTS_IMPORT_TARGET=local-preview and the isolated local preview database',
    );
  }
}

async function main(): Promise<void> {
  if (config.env === 'production') {
    throw new Error('Private post imports are disabled in production');
  }

  const sourceDirectory = path.resolve(
    argumentValue('--source') ?? path.resolve(__dirname, '../../..', '.private/posts'),
  );
  const source = loadAndValidateSource(sourceDirectory);
  const counts = {
    posts: source.manifest.posts.length,
    themes: source.taxonomy.themes.length,
    concepts: source.taxonomy.concepts.length,
    relations: source.manifest.posts.reduce((sum, post) => sum + post.relations.length, 0),
    bodyLinks: [...source.bodyLinks.values()].reduce((sum, links) => sum + links.length, 0),
  };

  if (process.argv.includes('--dry-run')) {
    console.log(`Validated private post import: ${JSON.stringify(counts)}`);
    return;
  }

  assertSafeImportTarget();
  console.log(
    `Import target confirmed: ${config.db.host}:${config.db.port}/${config.db.database}`,
  );
  await importSource(source);
  console.log(`Imported private post archive: ${JSON.stringify(counts)}`);
}

if (require.main === module) {
  main()
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Post import failed: ${message}`);
      process.exitCode = 1;
    })
    .finally(async () => {
      await db.destroy();
    });
}
