import path from 'path';
import dotenv from 'dotenv';

// Define the project root relative to the current file's directory (__dirname)
// This ensures it works correctly whether running from src/config or dist/config
const projectRoot = path.resolve(__dirname, '..', '..'); // Goes up two levels to the server/ directory


dotenv.config({
  // Use the explicitly calculated projectRoot path
  path: path.resolve(projectRoot, '.env'),
});

interface IConfig {
  env: string;
  port: number;
  apiPrefix: string;
  db: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
  };
  cors: {
    origin: string;
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
}

const config: IConfig = {
  env: process.env.NODE_ENV!,
  port: parseInt(process.env.PORT!, 10),
  apiPrefix: process.env.API_PREFIX!,
  db: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!, 10),
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
  },
  cors: {
    origin: process.env.CORS_ORIGIN!,
  },
  logLevel: process.env.LOG_LEVEL!,
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN!,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000', 10),
  },
  extraction: {
    cacheTTL: parseInt(process.env.EXTRACTION_CACHE_TTL || '3600', 10),
    rateLimit: parseInt(process.env.EXTRACTION_RATE_LIMIT || '10', 10),
  },
};

export default config;