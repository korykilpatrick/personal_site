import { Knex } from 'knex';

/**
 * Migration to create the additional schema for projects, gigs, and posts
 * Books-related tables already exist in the database
 */
export async function up(knex: Knex): Promise<void> {
  // Check if projects table exists and create it if it doesn't
  const hasProjectsTable = await knex.schema.hasTable('projects');
  if (!hasProjectsTable) {
    // Create projects table
    await knex.schema.createTable('projects', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.text('description').notNullable();
      table.jsonb('media_urls').nullable();
      table.text('project_links').nullable(); // Using text instead of jsonb for links
      table.text('writeup').nullable();
      table.text('project_tags').nullable(); // Using text instead of jsonb for tags
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    });
  }

  // Check if gigs table exists and create it if it doesn't
  const hasGigsTable = await knex.schema.hasTable('gigs');
  if (!hasGigsTable) {
    // Create gigs table
    await knex.schema.createTable('gigs', (table) => {
      table.increments('id').primary();
      table.string('company').notNullable();
      table.string('role').notNullable();
      table.string('duration').notNullable();
      table.text('achievements').notNullable();
      table.text('gig_links').nullable(); // Using text instead of jsonb for links
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    });
  }

  // Check if posts table exists and create it if it doesn't
  const hasPostsTable = await knex.schema.hasTable('posts');
  if (!hasPostsTable) {
    // Create posts table
    await knex.schema.createTable('posts', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.text('content').notNullable();
      table.date('date').notNullable();
      table.text('post_tags').nullable(); // Using text instead of jsonb for tags
      table.text('excerpt').nullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    });
  }
}

/**
 * Migration to drop only the newly created tables
 */
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('projects');
  await knex.schema.dropTableIfExists('gigs');
  await knex.schema.dropTableIfExists('posts');
}