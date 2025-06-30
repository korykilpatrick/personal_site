import { Knex } from 'knex';

/**
 * Add performance indexes for frequently queried columns
 * Part of Phase 2.2 performance optimizations
 */
export async function up(knex: Knex): Promise<void> {
  // Add indexes for library_items table
  await knex.schema.alterTable('library_items', (table) => {
    // Index for filtering by item type
    table.index('item_type_id', 'idx_library_items_type_id');
    
    // Index for sorting by creation date
    table.index('created_at', 'idx_library_items_created_at');
  });
  
  // GIN index for JSONB tags column (PostgreSQL specific)
  // This dramatically improves tag filtering performance
  await knex.raw('CREATE INDEX idx_library_items_tags ON library_items USING GIN (tags)');

  // Add indexes for other frequently queried tables
  await knex.schema.alterTable('quotes', (table) => {
    table.index('is_active', 'idx_quotes_is_active');
    table.index('display_order', 'idx_quotes_display_order');
  });

  await knex.schema.alterTable('site_notes', (table) => {
    table.index('is_active', 'idx_site_notes_is_active');
  });

  await knex.schema.alterTable('projects', (table) => {
    table.index('created_at', 'idx_projects_created_at');
  });

  await knex.schema.alterTable('work_entries', (table) => {
    table.index('created_at', 'idx_work_entries_created_at');
  });

  await knex.schema.alterTable('books', (table) => {
    table.index('date_read', 'idx_books_date_read');
    table.index('rating', 'idx_books_rating');
  });

  // Composite indexes for common query patterns
  await knex.schema.alterTable('library_items', (table) => {
    table.index(['item_type_id', 'created_at'], 'idx_library_items_type_created');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Remove library_items indexes
  await knex.schema.alterTable('library_items', (table) => {
    table.dropIndex('item_type_id', 'idx_library_items_type_id');
    table.dropIndex('created_at', 'idx_library_items_created_at');
    table.dropIndex(['item_type_id', 'created_at'], 'idx_library_items_type_created');
  });
  
  // Drop GIN index
  await knex.raw('DROP INDEX IF EXISTS idx_library_items_tags');

  // Remove other indexes
  await knex.schema.alterTable('quotes', (table) => {
    table.dropIndex('is_active', 'idx_quotes_is_active');
    table.dropIndex('display_order', 'idx_quotes_display_order');
  });

  await knex.schema.alterTable('site_notes', (table) => {
    table.dropIndex('is_active', 'idx_site_notes_is_active');
  });

  await knex.schema.alterTable('projects', (table) => {
    table.dropIndex('created_at', 'idx_projects_created_at');
  });

  await knex.schema.alterTable('work_entries', (table) => {
    table.dropIndex('created_at', 'idx_work_entries_created_at');
  });

  await knex.schema.alterTable('books', (table) => {
    table.dropIndex('date_read', 'idx_books_date_read');
    table.dropIndex('rating', 'idx_books_rating');
  });
}