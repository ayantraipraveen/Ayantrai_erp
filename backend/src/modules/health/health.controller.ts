import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { isMongoConnected } from '../../config/mongodb';
import { env } from '../../config/env';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export const getHealthStatus = asyncHandler(async (req: Request, res: Response) => {
  let postgresStatus = 'connected';
  let latency = 0;

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    latency = Date.now() - start;
  } catch (error) {
    postgresStatus = 'disconnected';
  }

  const mongoStatus = env.MONGODB_ENABLED
    ? isMongoConnected()
      ? 'connected'
      : 'disconnected'
    : 'standby (configured)';

  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: env.NODE_ENV,
    databases: {
      postgres: {
        status: postgresStatus,
        provider: 'Prisma ORM',
        latencyMs: latency,
      },
      mongodb: {
        status: mongoStatus,
        enabled: env.MONGODB_ENABLED,
      },
    },
  };

  res.status(200).json(new ApiResponse(200, healthData, 'System is healthy'));
});
