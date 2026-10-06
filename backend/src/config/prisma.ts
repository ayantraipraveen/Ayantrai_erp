import { PrismaClient } from '@prisma/client';
import { logger } from '../shared/utils/logger';

declare global {
  // Prevent multiple PrismaClient instances in development / hot reload
  var prismaInstance: PrismaClient | undefined;
}

export const prisma =
  global.prismaInstance ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prismaInstance = prisma;
}

/**
 * Connects and validates PostgreSQL connectivity via Prisma
 */
export async function connectPostgres(): Promise<boolean> {
  try {
    logger.info('Connecting to PostgreSQL database via Prisma ORM...');
    await prisma.$connect();
    logger.info('✅ PostgreSQL connected successfully via Prisma ORM.');
    return true;
  } catch (error) {
    logger.error('❌ Failed to connect to PostgreSQL database:', error);
    return false;
  }
}

/**
 * Gracefully disconnects Prisma client
 */
export async function disconnectPostgres(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('PostgreSQL Prisma connection closed.');
  } catch (error) {
    logger.error('Error disconnecting PostgreSQL Prisma client:', error);
  }
}

export default prisma;
