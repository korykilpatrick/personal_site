import path from 'path';
import dotenv from 'dotenv';

// Define the project root relative to the current file's directory (__dirname)
// This ensures it works correctly whether running from src/config or dist/config
const projectRoot = path.resolve(__dirname, '..', '..'); // Goes up two levels to the server/ directory

// Load and validate environment variables using dotenv-safe. This will throw if any
// variable declared in `.env.example` is missing or empty in `.env`.
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
};

export default config;