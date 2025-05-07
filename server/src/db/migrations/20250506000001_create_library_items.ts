import type { Knex } from 'knex';

const ITEMS_TABLE = 'library_items';
const ITEM_TYPES_TABLE = 'library_item_types';

export async function up(knex: Knex): Promise<void> {
  // Create library_items table
  await knex.schema.createTable(ITEMS_TABLE, (table) => {
    table.increments('id').primary();
    table.integer('item_type_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable(ITEM_TYPES_TABLE)
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    table.text('link').notNullable();
    table.text('title').notNullable();
    table.text('blurb').nullable();
    table.text('thumbnail_url').nullable();
    table.jsonb('tags').nullable();
    table.jsonb('creators').nullable(); // NEW FIELD

    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(ITEMS_TABLE);
}