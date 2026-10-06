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
  JWT_SECRET: string;
}

export const env: EnvConfig = {
  PORT: parseInt(process.env.PORT || '5001', 10),
  NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/ayantrai_erp?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'ayantrai-erp-development-secret-key-change-in-production',
};

export default env;
