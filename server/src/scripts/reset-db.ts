import { Client } from 'pg';
import knex from 'knex';
import dotenvSafe from 'dotenv-safe';
import path from 'path';
import logger from '../utils/logger';
import knexConfig from '../db/knexfile';

// Load env vars and validate
dotenvSafe.config({
  path: path.resolve(__dirname, '../../.env'),
  example: path.resolve(__dirname, '../../.env.example'),
  allowEmptyValues: false,
});

/**
 * Script to reset the database (drop and recreate)
 */
async function resetDatabase() {
  const environment = process.env.NODE_ENV!;
  const dbName = process.env.DB_NAME!;
  
  // Connect to default PostgreSQL database
  const client = new Client({
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!, 10),
    database: 'postgres', // Connect to default postgres database
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
  });

  try {
    // First, terminate all connections to the database
    await client.connect();
    logger.info('Connected to PostgreSQL server');
    
    // Check if database exists
    const checkQuery = `
      SELECT 1 FROM pg_database WHERE datname = $1
    `;
    const checkResult = await client.query(checkQuery, [dbName]);
    
    if (checkResult.rowCount !== null && checkResult.rowCount > 0) {
      // Database exists, terminate all connections and drop it
      const terminateQuery = `
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
          AND pid <> pg_backend_pid()
      `;
      await client.query(terminateQuery, [dbName]);
      logger.info(`Terminated all connections to '${dbName}'`);
      
      // Drop the database
      const dropQuery = `DROP DATABASE ${dbName}`;
      await client.query(dropQuery);
      logger.info(`Database '${dbName}' dropped successfully`);
    }
    
    // Create the database
    const createQuery = `CREATE DATABASE ${dbName}`;
    await client.query(createQuery);
    logger.info(`Database '${dbName}' created successfully`);
    
    // Close the connection to postgres database
    await client.end();
    
    // Now connect to our new database and run migrations and seeds
    const db = knex(knexConfig[environment]);
    
    // Run migrations
    logger.info('Running migrations...');
    await db.migrate.latest();
    logger.info('Migrations completed successfully');
    
    // Run seeds
    logger.info('Running seeds...');
    await db.seed.run();
    logger.info('Seeds completed successfully');
    
    // Close database connection
    await db.destroy();
  } catch (error) {
    logger.error('Error resetting database', { error });
    process.exit(1);
  }
}

// Execute the function
resetDatabase()
  .then(() => {
    logger.info('Database reset complete');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Database reset failed', { error });
    process.exit(1);
  });