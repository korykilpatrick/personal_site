import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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
  admin: {
    username: string;
    passwordHash: string;
  };
}

const config: IConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || '/api',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'personal_site',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
  jwt: {
    secret: process.env.JWT_SECRET || 'YOUR_DEFAULT_SECRET', // Change this!
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    // IMPORTANT: Generate a real hash and store it in .env
    passwordHash: process.env.ADMIN_PASSWORD_HASH || '$2b$10$YNxwTsS56FELZgjAp5Iv6uT01Og1kbC7z9ASoYdXKDcVUiqAkf5MO', 
  },
};

export default config;