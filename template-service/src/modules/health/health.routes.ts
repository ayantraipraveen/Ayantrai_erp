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

  res.status(200).json(
    new ApiResponse(
      200,
      {
        service: 'template-service',
        status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
        uptime: process.uptime(),
        database: {
          postgresql: dbStatus,
        },
        timestamp: new Date().toISOString(),
      },
      'Template Microservice health probe'
    )
  );
});

export default router;
