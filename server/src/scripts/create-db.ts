import { Client } from 'pg';
import knex from 'knex';
import dotenv from 'dotenv';
import path from 'path';
import logger from '../utils/logger';
import knexConfig from '../db/knexfile';

// Load env variables with validation
dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
});

/**
 * Script to create the database and tables if they don't exist
 */
async function createDatabase() {
  const environment = process.env.NODE_ENV!;
  const dbName = process.env.DB_NAME!;
  
  // Check if database already exists - not needed for cloud DB
  logger.info(`Using database '${dbName}' on host ${process.env.DB_HOST}`);
  
  try {
    // Connect to our database and run migrations
    const db = knex(knexConfig[environment]);
    
    // Run a test query
    await db.raw('SELECT 1');
    logger.info(`Connected to database '${dbName}'`);
    
    // Check if books table exists
    const hasBooks = await db.schema.hasTable('books');
    if (!hasBooks) {
      logger.info('Creating tables...');
      
      // Create books table
      await db.schema.createTable('books', (table) => {
        table.increments('id').primary();
        table.integer('goodreads_id').notNullable();
        table.string('img_url', 255).nullable();
        table.string('img_url_small', 255).nullable();
        table.string('title', 255).notNullable();
        table.string('book_link', 255).nullable();
        table.string('author', 255).notNullable();
        table.string('author_link', 255).nullable();
        table.integer('num_pages').nullable();
        table.float('avg_rating').nullable();
        table.integer('num_ratings').nullable();
        table.string('date_pub', 30).nullable();
        table.integer('rating').nullable();
        table.text('blurb').nullable();
        table.string('date_added', 30).nullable();
        table.string('date_started', 30).nullable();
        table.string('date_read', 30).nullable();
        table.timestamp('created_at').notNullable().defaultTo(db.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(db.fn.now());
      });
      logger.info('Books table created');

      // Create bookshelves table
      await db.schema.createTable('bookshelves', (table) => {
        table.increments('id').primary();
        table.string('name', 50).notNullable();
        table.timestamp('created_at').nullable().defaultTo(db.fn.now());
      });
      logger.info('Bookshelves table created');

      // Create books_shelves junction table
      await db.schema.createTable('books_shelves', (table) => {
        table.increments('id').primary();
        table.integer('book_id').nullable().references('id').inTable('books').onDelete('CASCADE');
        table.integer('shelf_id').nullable().references('id').inTable('bookshelves').onDelete('CASCADE');
        table.timestamp('created_at').nullable().defaultTo(db.fn.now());
      });
      logger.info('Books_shelves junction table created');

      // Create projects table
      await db.schema.createTable('projects', (table) => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.text('description').notNullable();
        table.jsonb('media_urls').nullable();
        table.jsonb('links').nullable();
        table.text('writeup').nullable();
        table.jsonb('tags').nullable();
        table.timestamp('created_at').notNullable().defaultTo(db.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(db.fn.now());
      });
      logger.info('Projects table created');

      // Create work_entries table (renamed from gigs)
      await db.schema.createTable('work_entries', (table) => {
        table.increments('id').primary();
        table.string('company').notNullable();
        table.string('role').notNullable();
        table.string('duration').notNullable();
        table.text('achievements').notNullable();
        table.jsonb('work_entry_links').nullable(); // Updated column name
        table.timestamp('created_at').notNullable().defaultTo(db.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(db.fn.now());
      });
      logger.info('Work entries table created'); // Updated log message
      
      logger.info('All tables created successfully');
    } else {
      logger.info('Tables already exist');
    }
    
    // Close database connection
    await db.destroy();
  } catch (error) {
    logger.error('Error setting up database', { error });
    process.exit(1);
  }
}

// Execute the function
createDatabase()
  .then(() => {
    logger.info('Database setup complete');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Database setup failed', { error });
    process.exit(1);
  });