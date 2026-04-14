import knex from 'knex';
import config from '../config/config';
import knexfileImport from './knexfile';
import logger from '../utils/logger';

const environment = config.env ?? 'development';
const db = knex(knexfileImport[environment]);

export const testConnection = async (): Promise<void> => {
  await db.raw('select 1');
  logger.info(`Connected to database (${environment})`);
};

/* --- exports --- */
export { db };          // named export for legacy code
export default db;      // default export for newer code
