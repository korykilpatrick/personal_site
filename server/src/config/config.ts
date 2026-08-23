import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

// Define the project root relative to the current file's directory (__dirname)
// This ensures it works correctly whether running from src/config or dist/config
const projectRoot = path.resolve(__dirname, '..', '..'); // Goes up two levels to the server/ directory
const environmentFile = process.env.ENV_FILE
  ? path.resolve(projectRoot, process.env.ENV_FILE)
  : path.resolve(projectRoot, '.env');


dotenv.config({
  path: environmentFile,
});

const envSchema = z.object({
  NODE_ENV: z.string(),
  PORT: z.coerce.number(),
  HOST: z.string().optional(),
  API_PREFIX: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_NAME: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  CORS_ORIGIN: z.string(),
  LOG_LEVEL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  OPENAI_TEMPERATURE: z.coerce.number().optional(),
  OPENAI_MAX_TOKENS: z.coerce.number().optional(),
  EXTRACTION_CACHE_TTL: z.coerce.number().optional(),
  EXTRACTION_RATE_LIMIT: z.coerce.number().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().optional(),
});

const envResult = envSchema.safeParse(process.env);
if (!envResult.success) {
  throw new Error(`Invalid environment configuration: ${envResult.error.message}`);
}

const env = envResult.data;

interface IConfig {
  env: string;
  port: number;
  host: string;
  apiPrefix: string;
  db: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  cors: {
    origin: string | string[];
  };
  logLevel: string;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  openai: {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
  extraction: {
    cacheTTL: number;
    rateLimit: number;
  };
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
}

const config: IConfig = {
  env: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST ?? '0.0.0.0',
  apiPrefix: env.API_PREFIX,
  db: {
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  },
  cors: {
    origin: env.CORS_ORIGIN.includes(',')
      ? env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : env.CORS_ORIGIN,
  },
  logLevel: env.LOG_LEVEL,
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  openai: {
    apiKey: env.OPENAI_API_KEY || '',
    model: env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    temperature: env.OPENAI_TEMPERATURE ?? 0.3,
    maxTokens: env.OPENAI_MAX_TOKENS ?? 1000,
  },
  extraction: {
    cacheTTL: env.EXTRACTION_CACHE_TTL ?? 3600,
    rateLimit: env.EXTRACTION_RATE_LIMIT ?? 10,
  },
  redis: env.REDIS_HOST ? {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT ?? 6379,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB ?? 0,
  } : undefined,
};

export default config;
