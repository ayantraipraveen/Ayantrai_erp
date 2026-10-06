import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // If response already committed, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any[] = [];

  // Custom ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }
  // Zod Validation Error
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
  }
  // Prisma Known Request Errors
  else if (
    (err as any)?.name === 'PrismaClientKnownRequestError' ||
    (typeof (err as any)?.code === 'string' && (err as any).code.startsWith('P'))
  ) {
    statusCode = 400;
    const code = (err as any).code;
    if (code === 'P2002') {
      const target = Array.isArray((err as any).meta?.target)
        ? (err as any).meta.target.join(', ')
        : 'field';
      message = `Unique constraint violation: A record with this ${target} already exists.`;
    } else if (code === 'P2025') {
      statusCode = 404;
      message = 'The requested database record was not found.';
    } else {
      message = `Database query error (Prisma code ${code})`;
    }
  }
  // Standard Error
  else if (err instanceof Error) {
    message = err.message;
  }

  // Log error
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} - 500 Error:`, err);
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} - ${statusCode} Client Error: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: errors.length > 0 ? errors : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString(),
  });
}

export default errorHandler;
