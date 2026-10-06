import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { env } from './config/env';
import apiRoutes from './modules';
import { notFound } from './shared/middlewares/notFound';
import { errorHandler } from './shared/middlewares/errorHandler';

export function createApp(): Application {
  const app = express();

  // Security & HTTP utility middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // HTTP Request logger in development
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // Mount API modules under configured prefix (/api/v1)
  app.use(env.API_PREFIX, apiRoutes);

  // 404 Route Not Found handler
  app.use(notFound);

  // Centralized Error handler
  app.use(errorHandler);

  return app;
}

export default createApp;
