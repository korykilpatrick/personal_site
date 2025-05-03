import type { Knex } from "knex";

const SITE_NOTES_TABLE = 'site_notes';
const QUOTES_TABLE = 'quotes';


export async function up(knex: Knex): Promise<void> {
  // Create site_notes table
  await knex.schema.createTable(SITE_NOTES_TABLE, (table) => {
    table.increments('id').primary();
    table.text('content').notNullable();
    table.boolean('is_active').notNullable().defaultTo(false).index(); // Only one should be true
    table.timestamps(true, true); // Adds created_at and updated_at with defaults
  });

  // Create quotes table
  await knex.schema.createTable(QUOTES_TABLE, (table) => {
    table.increments('id').primary();
    table.text('text').notNullable();
    table.string('author').nullable(); // Using string based on users table, text is also fine
    table.string('source').nullable();
    table.integer('display_order').nullable().index();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(QUOTES_TABLE);
  await knex.schema.dropTableIfExists(SITE_NOTES_TABLE);
}

