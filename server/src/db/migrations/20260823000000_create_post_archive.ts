import type { Knex } from 'knex';

const POSTS = 'posts';
const THEMES = 'post_themes';
const CONCEPTS = 'post_concepts';
const THEME_ASSIGNMENTS = 'post_theme_assignments';
const CONCEPT_ASSIGNMENTS = 'post_concept_assignments';
const RELATIONS = 'post_relations';
const BODY_LINKS = 'post_body_links';
const GRAPH_META = 'post_graph_layout_meta';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(POSTS, (table) => {
    table.increments('id').primary();
    table.string('slug', 180).notNullable().unique();
    table.string('title', 320).notNullable();
    table.text('dek').notNullable();
    table.text('body_markdown').notNullable();
    table.string('status', 20).notNullable().defaultTo('draft');
    table.string('source_period', 120).notNullable();
    table.timestamp('published_at', { useTz: true }).nullable();
    table.text('social_image_url').nullable();
    table.boolean('featured').notNullable().defaultTo(false);
    table.boolean('is_active').notNullable().defaultTo(true);
    table.integer('display_order').notNullable();
    table.integer('word_count').notNullable();
    table.integer('reading_minutes').notNullable();
    table.float('graph_x').nullable();
    table.float('graph_y').nullable();
    table.timestamp('editorial_updated_at', { useTz: true }).nullable();
    table.timestamps(true, true);
    table.index(['is_active', 'status', 'published_at', 'display_order'], 'posts_visibility_order_idx');
  });

  await knex.schema.createTable(THEMES, (table) => {
    table.string('id', 120).primary();
    table.string('title', 240).notNullable();
    table.text('description').notNullable();
    table.integer('display_order').notNullable();
    table.string('tone', 40).notNullable();
    table.float('anchor_x').notNullable();
    table.float('anchor_y').notNullable();
    table.float('label_offset_x').nullable();
    table.float('label_offset_y').nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable(CONCEPTS, (table) => {
    table.string('id', 120).primary();
    table.string('label', 240).notNullable();
    table.jsonb('aliases').notNullable().defaultTo(knex.raw("'[]'::jsonb"));
    table.timestamps(true, true);
  });

  await knex.schema.createTable(THEME_ASSIGNMENTS, (table) => {
    table.integer('post_id').unsigned().notNullable().references('id').inTable(POSTS).onDelete('CASCADE');
    table.string('theme_id', 120).notNullable().references('id').inTable(THEMES).onDelete('RESTRICT');
    table.string('role', 20).notNullable();
    table.integer('display_order').notNullable().defaultTo(0);
    table.primary(['post_id', 'theme_id']);
    table.index(['theme_id', 'role'], 'post_theme_assignments_theme_role_idx');
  });

  await knex.schema.createTable(CONCEPT_ASSIGNMENTS, (table) => {
    table.integer('post_id').unsigned().notNullable().references('id').inTable(POSTS).onDelete('CASCADE');
    table.string('concept_id', 120).notNullable().references('id').inTable(CONCEPTS).onDelete('RESTRICT');
    table.integer('display_order').notNullable().defaultTo(0);
    table.primary(['post_id', 'concept_id']);
    table.index(['concept_id', 'display_order'], 'post_concept_assignments_concept_idx');
  });

  await knex.schema.createTable(RELATIONS, (table) => {
    table.increments('id').primary();
    table.integer('from_post_id').unsigned().notNullable().references('id').inTable(POSTS).onDelete('CASCADE');
    table.integer('to_post_id').unsigned().notNullable().references('id').inTable(POSTS).onDelete('CASCADE');
    table.string('kind', 32).notNullable();
    table.text('reason').notNullable();
    table.integer('display_order').notNullable().defaultTo(0);
    table.unique(['from_post_id', 'to_post_id', 'kind']);
    table.index(['to_post_id', 'from_post_id'], 'post_relations_reverse_idx');
  });

  await knex.schema.createTable(BODY_LINKS, (table) => {
    table.integer('from_post_id').unsigned().notNullable().references('id').inTable(POSTS).onDelete('CASCADE');
    table.integer('to_post_id').unsigned().notNullable().references('id').inTable(POSTS).onDelete('CASCADE');
    table.primary(['from_post_id', 'to_post_id']);
    table.index(['to_post_id', 'from_post_id'], 'post_body_links_reverse_idx');
  });

  await knex.schema.createTable(GRAPH_META, (table) => {
    table.integer('id').primary();
    table.string('algorithm_version', 120).notNullable();
    table.string('source_fingerprint', 80).notNullable();
    table.float('minimum_distance').notNullable();
    table.timestamps(true, true);
  });

  await knex.raw(`alter table ${POSTS} add constraint posts_slug_format_check check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')`);
  await knex.raw(`alter table ${POSTS} add constraint posts_status_check check (status in ('draft', 'published'))`);
  await knex.raw(`alter table ${POSTS} add constraint posts_required_copy_check check (btrim(title) <> '' and btrim(dek) <> '' and btrim(body_markdown) <> '' and btrim(source_period) <> '')`);
  await knex.raw(`alter table ${POSTS} add constraint posts_publication_check check (status <> 'published' or published_at is not null)`);
  await knex.raw(`alter table ${POSTS} add constraint posts_positive_counts_check check (display_order > 0 and word_count >= 0 and reading_minutes > 0)`);
  await knex.raw(`alter table ${POSTS} add constraint posts_graph_pair_check check ((graph_x is null and graph_y is null) or (graph_x is not null and graph_y is not null and graph_x between 0 and 1 and graph_y between 0 and 1))`);
  await knex.raw(`alter table ${THEMES} add constraint post_themes_id_format_check check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$')`);
  await knex.raw(`alter table ${THEMES} add constraint post_themes_copy_check check (btrim(title) <> '' and btrim(description) <> '')`);
  await knex.raw(`alter table ${THEMES} add constraint post_themes_tone_check check (tone in ('navy', 'oxblood', 'walnut', 'old-gold', 'sage', 'plum', 'rust', 'slate'))`);
  await knex.raw(`alter table ${THEMES} add constraint post_themes_anchor_check check (anchor_x between 0 and 1 and anchor_y between 0 and 1)`);
  await knex.raw(`alter table ${THEMES} add constraint post_themes_label_offset_pair_check check ((label_offset_x is null and label_offset_y is null) or (label_offset_x is not null and label_offset_y is not null))`);
  await knex.raw(`alter table ${CONCEPTS} add constraint post_concepts_id_format_check check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$')`);
  await knex.raw(`alter table ${CONCEPTS} add constraint post_concepts_label_check check (btrim(label) <> '')`);
  await knex.raw(`alter table ${THEME_ASSIGNMENTS} add constraint post_theme_assignments_role_check check (role in ('primary', 'secondary'))`);
  await knex.raw(`create unique index post_theme_assignments_one_primary_idx on ${THEME_ASSIGNMENTS} (post_id) where role = 'primary'`);
  await knex.raw(`alter table ${RELATIONS} add constraint post_relations_no_self_check check (from_post_id <> to_post_id)`);
  await knex.raw(`alter table ${RELATIONS} add constraint post_relations_kind_check check (kind in ('related', 'continues', 'contrasts', 'applies', 'echoes', 'origin'))`);
  await knex.raw(`alter table ${RELATIONS} add constraint post_relations_reason_check check (btrim(reason) <> '')`);
  await knex.raw(`alter table ${BODY_LINKS} add constraint post_body_links_no_self_check check (from_post_id <> to_post_id)`);
  await knex.raw(`alter table ${GRAPH_META} add constraint post_graph_layout_meta_singleton_check check (id = 1)`);
  await knex.raw(`alter table ${GRAPH_META} add constraint post_graph_layout_meta_distance_check check (minimum_distance > 0 and minimum_distance < 1)`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(GRAPH_META);
  await knex.schema.dropTableIfExists(BODY_LINKS);
  await knex.schema.dropTableIfExists(RELATIONS);
  await knex.schema.dropTableIfExists(CONCEPT_ASSIGNMENTS);
  await knex.schema.dropTableIfExists(THEME_ASSIGNMENTS);
  await knex.schema.dropTableIfExists(CONCEPTS);
  await knex.schema.dropTableIfExists(THEMES);
  await knex.schema.dropTableIfExists(POSTS);
}
