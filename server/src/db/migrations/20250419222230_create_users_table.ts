import type { Knex } from "knex";

const TABLE_NAME = 'users';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments('id').primary();
    table.string('username').notNullable().unique();
    table.string('password_hash').notNullable(); // Store the hashed password
    table.timestamps(true, true); // Adds created_at and updated_at with defaults
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE_NAME);
}

