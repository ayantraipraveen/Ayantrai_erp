import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  API_PREFIX: string;
  CORS_ORIGIN: string;
  DATABASE_URL: string;
  MONGODB_URI: string;
  MONGODB_ENABLED: boolean;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
}

export const env: EnvConfig = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:30005',

  // Primary Database (PostgreSQL via Prisma)
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/ayantrai_erp?schema=public',

  // Secondary Database (MongoDB)
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ayantrai_erp',
  MONGODB_ENABLED: process.env.MONGODB_ENABLED === 'true',

  // Security
  JWT_SECRET: process.env.JWT_SECRET || 'ayantrai-erp-default-secret-key-12345',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};

export default env;
