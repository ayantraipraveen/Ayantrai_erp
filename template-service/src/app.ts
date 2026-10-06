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

  // Security & Optimization Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: [env.CORS_ORIGIN, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // Mount API Routes (/api/v1)
  app.use(env.API_PREFIX, apiRoutes);

  // 404 & Error Handlers
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;
