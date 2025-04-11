import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  // Drop the blog posts table
  await knex.schema.dropTableIfExists('posts');

  // Drop the timeline table (if it exists for some reason)
  await knex.schema.dropTableIfExists('timeline');

  // Rename the gigs table to work_entries
  // Check if 'gigs' table exists before renaming
  const hasGigsTable = await knex.schema.hasTable('gigs');
  if (hasGigsTable) {
    await knex.schema.renameTable('gigs', 'work_entries');

    // Also rename the column within the newly renamed table
    await knex.schema.alterTable('work_entries', (table) => {
      table.renameColumn('gig_links', 'work_entry_links');
    });
  }
}


export async function down(knex: Knex): Promise<void> {
  // Check if 'work_entries' table exists before altering/renaming
  const hasWorkEntriesTable = await knex.schema.hasTable('work_entries');
  if (hasWorkEntriesTable) {
    // Rename column back first
    await knex.schema.alterTable('work_entries', (table) => {
      table.renameColumn('work_entry_links', 'gig_links');
    });
    // Then rename table back
     await knex.schema.renameTable('work_entries', 'gigs');
  }


  // Recreate posts table (using definition from initial schema)
  const hasPostsTable = await knex.schema.hasTable('posts');
  if (!hasPostsTable) {
    await knex.schema.createTable('posts', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.text('content').notNullable();
      table.date('date').notNullable();
      table.text('post_tags').nullable();
      table.text('excerpt').nullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    });
  }

  // Note: Not recreating 'timeline' table as it wasn't in the initial schema provided
}

