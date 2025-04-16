import dotenvSafe from 'dotenv-safe';
import path from 'path';
import { Knex } from 'knex';

// Load and validate env vars (throws if any required are missing)
dotenvSafe.config({
  path: path.resolve(__dirname, '../../.env'),
  example: path.resolve(__dirname, '../../.env.example'),
  allowEmptyValues: false,
});

// Database configuration for different environments
interface IKnexConfig {
  [key: string]: Knex.Config;
}

const config: IKnexConfig = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST!,
      port: parseInt(process.env.DB_PORT!, 10),
      database: process.env.DB_NAME!,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
    },
  },
  test: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST!,
      port: parseInt(process.env.DB_PORT!, 10),
      database: `${process.env.DB_NAME!}_test`,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
    },
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST!,
      port: parseInt(process.env.DB_PORT!, 10),
      database: process.env.DB_NAME!,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : { rejectUnauthorized: false },
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: path.join(__dirname, 'seeds'),
    },
  },
};

export default config;