// server/src/db/connection.ts
import knex from 'knex';
import config from '../config/config';
import knexfileImport from './knexfile';
import logger from '../utils/logger';

// knexfile’s default export holds the env configs when compiled to CommonJS
const knexConfigs = (knexfileImport as any).default ?? knexfileImport;

const environment = config.env || 'development';
const db = knex(knexConfigs[environment]);

export const testConnection = async (): Promise<void> => {
  await db.raw('select 1');
  logger.info('Connected to database');
};

export { db };
