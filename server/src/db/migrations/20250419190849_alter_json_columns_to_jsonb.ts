import type { Knex } from "knex";

const PROJECTS_TABLE = 'projects';
const WORK_ENTRIES_TABLE = 'work_entries';

export async function up(knex: Knex): Promise<void> {
  // Use knex.raw for altering type and casting simultaneously
  await knex.raw(`ALTER TABLE ${PROJECTS_TABLE} 
    ALTER COLUMN project_links TYPE JSONB USING project_links::jsonb, 
    ALTER COLUMN project_tags TYPE JSONB USING project_tags::jsonb;`);

  await knex.raw(`ALTER TABLE ${WORK_ENTRIES_TABLE} 
    ALTER COLUMN work_entry_links TYPE JSONB USING work_entry_links::jsonb;`);
}


export async function down(knex: Knex): Promise<void> {
  // Use knex.raw for reverting type and casting simultaneously
  await knex.raw(`ALTER TABLE ${PROJECTS_TABLE} 
    ALTER COLUMN project_links TYPE TEXT USING project_links::text, 
    ALTER COLUMN project_tags TYPE TEXT USING project_tags::text;`);

  await knex.raw(`ALTER TABLE ${WORK_ENTRIES_TABLE} 
    ALTER COLUMN work_entry_links TYPE TEXT USING work_entry_links::text;`);
}

