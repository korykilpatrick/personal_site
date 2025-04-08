import knex from 'knex';
import config from '../config/config';
import logger from '../utils/logger';
import knexConfig from './knexfile';

// Determine the environment
const environment = config.env;

// Create knex instance
const db = knex(knexConfig[environment]);

// Test the database connection
const testConnection = async (): Promise<void> => {
  try {
    await db.raw('SELECT 1');
    logger.info(`Database connection established in ${environment} mode`);
  } catch (error) {
    logger.error('Database connection failed', { error });
    process.exit(1);
  }
};

export { db, testConnection };