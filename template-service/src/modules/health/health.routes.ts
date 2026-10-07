import { Router, Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { ApiResponse } from '../../shared/utils/apiResponse';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  let dbStatus = 'healthy';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e: any) {
    dbStatus = `degraded: ${e.message}`;
  }

  const isHealthy = dbStatus === 'healthy';
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      {
        service: 'template-service',
        status: isHealthy ? 'healthy' : 'degraded',
        uptime: process.uptime(),
        database: {
          postgresql: dbStatus,
        },
      },
      isHealthy
        ? 'Template Microservice is healthy'
        : 'Template Microservice database connection degraded'
    )
  );
});

export default router;
