import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../shared/utils/logger';

/**
 * MongoDB Configuration & Connection Manager
 * 
 * Note: PostgreSQL is the primary database for this ERP (managed via Prisma).
 * MongoDB is configured as a secondary store (e.g. for high-volume IoT telemetry / unstructured logs).
 * It runs in standby mode unless MONGODB_ENABLED=true in .env.
 */

export async function connectMongo(): Promise<boolean> {
  if (!env.MONGODB_ENABLED) {
    logger.info('ℹ️  MongoDB is currently in standby mode (MONGODB_ENABLED=false). Configuration is primed and ready.');
    return false;
  }

  try {
    logger.info(`Connecting to MongoDB at: ${env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}...`);
    
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: env.NODE_ENV !== 'production',
    });

    logger.info('✅ MongoDB connected successfully.');
    return true;
  } catch (error) {
    logger.warn('⚠️ MongoDB connection failed (running in degraded mode without MongoDB):', error);
    return false;
  }
}

/**
 * Checks if MongoDB is currently connected
 */
export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Gracefully closes MongoDB connection
 */
export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
      logger.info('MongoDB connection closed.');
    } catch (error) {
      logger.error('Error disconnecting MongoDB:', error);
    }
  }
}

export default mongoose;
