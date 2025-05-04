import knex from 'knex';
import config from '../config/config';
import knexfileImport from './knexfile';
import logger from '../utils/logger';

// unwrap the CommonJS wrapper that tsc adds
const knexConfigs = (knexfileImport as any).default ?? knexfileImport;

const environment = config.env ?? 'development';
const db = knex(knexConfigs[environment]);

export const testConnection = async (): Promise<void> => {
  await db.raw('select 1');
  logger.info(`Connected to database (${environment})`);
};

/* --- exports --- */
export { db };          // named export for legacy code
export default db;      // default export for newer code
