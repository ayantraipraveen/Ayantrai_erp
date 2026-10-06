import { createApp } from './app';
import { env } from './config/env';
import { initializeDatabases, shutdownDatabases } from './config/database';
import { logger } from './shared/utils/logger';

async function bootstrap() {
  // 1. Initialize databases (Postgres via Prisma + Mongo standby config)
  await initializeDatabases();

  // 2. Create Express application
  const app = createApp();

  // 3. Start HTTP server
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Sitesafe ERP Backend server is running at: http://localhost:${env.PORT}`);
    logger.info(`📡 API Health Check available at: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
    logger.info(`⚙️  Environment: ${env.NODE_ENV}`);
  });

  // 4. Graceful shutdown handler
  const handleShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Gracefully shutting down server...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      await shutdownDatabases();
      process.exit(0);
    });

    // Force shutdown after timeout if hanging
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  logger.error('Fatal error during backend bootstrap:', error);
  process.exit(1);
});
