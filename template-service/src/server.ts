import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

async function bootstrap() {
  const app = createApp();

  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully (Template Microservice pool)');
  } catch (err: any) {
    console.error('⚠️ Warning: PostgreSQL connection failed on startup:', err.message);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`================================================================`);
    console.log(`🚀 SITESAFE TEMPLATE MICROSERVICE RUNNING`);
    console.log(`📡 URL: http://localhost:${env.PORT}${env.API_PREFIX}/templates`);
    console.log(`🏥 Health Probe: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
    console.log(`🔒 Environment: ${env.NODE_ENV}`);
    console.log(`================================================================`);
  });

  const shutdown = async () => {
    console.log('Gracefully shutting down template-service...');
    await prisma.$disconnect();
    server.close(() => {
      console.log('Server terminated cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  console.error('Fatal startup error in template-service:', error);
  process.exit(1);
});
