import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { ZodError } from 'zod';
import { env } from '../../config/env';

/**
 * Global Enterprise Error Handler for Template Microservice
 * Standardizes all error responses into a consistent JSON envelope:
 * {
 *   success: false,
 *   statusCode: number,
 *   message: string,
 *   errors?: any[],
 *   stack?: string (development only),
 *   timestamp: string
 * }
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // If response has already started streaming, delegate to Express
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: any[] = [];

  // 1. Custom Application Error (ApiError)
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || [];
  }
  // 2. Zod Request Body / Query Validation Error
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Request validation failed';
    errors = err.errors.map((issue) => ({
      field: issue.path.filter((p) => p !== 'body' && p !== 'query' && p !== 'params').join('.') || issue.path.join('.'),
      message: issue.message,
    }));
  }
  // 3. JSON Syntax / Malformed Body Error
  else if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    statusCode = 400;
    message = 'Malformed JSON payload in request body';
  }
  // 4. Prisma Known Request Errors
  else if (
    (err as any)?.name === 'PrismaClientKnownRequestError' ||
    (typeof (err as any)?.code === 'string' && (err as any).code.startsWith('P'))
  ) {
    const code = (err as any).code;
    if (code === 'P2002') {
      statusCode = 409;
      const target = Array.isArray((err as any).meta?.target)
        ? (err as any).meta.target.join(', ')
        : 'field';
      message = `Unique constraint violation: A template or record with this ${target} already exists.`;
    } else if (code === 'P2025') {
      statusCode = 404;
      message = 'The requested database record was not found.';
    } else if (code === 'P2003') {
      statusCode = 400;
      message = 'Foreign key constraint failed on referenced entity.';
    } else {
      statusCode = 400;
      message = `Database query error (Prisma code ${code})`;
    }
  }
  // 5. JWT Authentication Errors
  else if (err?.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err?.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please sign in again.';
  }
  // 6. Generic Standard Error
  else if (err instanceof Error) {
    message = err.message;
  }

  // Structured console logging in terminal
  if (statusCode >= 500) {
    console.error(`❌ [500] ${req.method} ${req.originalUrl}:`, err);
  } else if (env.NODE_ENV === 'development') {
    console.warn(`⚠️ [${statusCode}] ${req.method} ${req.originalUrl}: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  });
}

export default errorHandler;
