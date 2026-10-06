import { connectPostgres, disconnectPostgres } from './prisma';
import { connectMongo, disconnectMongo, isMongoConnected } from './mongodb';
import { logger } from '../shared/utils/logger';

export interface DatabaseStatus {
  postgres: 'connected' | 'disconnected' | 'error';
  mongodb: 'connected' | 'standby' | 'disconnected' | 'error';
}

/**
 * Initializes all configured databases
 * 1. PostgreSQL (Primary - Prisma)
 * 2. MongoDB (Secondary - Standby / Active)
 */
export async function initializeDatabases(): Promise<DatabaseStatus> {
  logger.info('Initializing ERP-Ayantrai Database Connections...');

  const status: DatabaseStatus = {
    postgres: 'disconnected',
    mongodb: 'standby',
  };

  // 1. Initialize PostgreSQL (Prisma)
  try {
    const pgSuccess = await connectPostgres();
    status.postgres = pgSuccess ? 'connected' : 'disconnected';
  } catch (error) {
    status.postgres = 'error';
  }

  // 2. Initialize MongoDB (Configuration Ready)
  try {
    const mongoSuccess = await connectMongo();
    if (mongoSuccess) {
      status.mongodb = 'connected';
    } else {
      status.mongodb = isMongoConnected() ? 'connected' : 'standby';
    }
  } catch (error) {
    status.mongodb = 'error';
  }

  return status;
}

/**
 * Gracefully shuts down all database connections
 */
export async function shutdownDatabases(): Promise<void> {
  logger.info('Closing database connections...');
  await Promise.allSettled([disconnectPostgres(), disconnectMongo()]);
  logger.info('All database connections closed.');
}
