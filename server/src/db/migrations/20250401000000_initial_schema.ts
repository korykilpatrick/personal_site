import { Knex } from 'knex';

/**
 * Migration to create the initial schema for projects and work_entries
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

  // Check if work_entries table exists and create it if it doesn't
  const hasWorkEntriesTable = await knex.schema.hasTable('work_entries');
  if (!hasWorkEntriesTable) {
    // Create work_entries table (renamed from gigs)
    await knex.schema.createTable('work_entries', (table) => {
      table.increments('id').primary();
      table.string('company').notNullable();
      table.string('role').notNullable();
      table.string('duration').notNullable();
      table.text('achievements').notNullable();
      table.text('work_entry_links').nullable(); // Updated column name
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    });
  }
}

/**
 * Migration to drop only the tables created in this initial migration
 */
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('projects');
  await knex.schema.dropTableIfExists('work_entries'); // Renamed from gigs
}