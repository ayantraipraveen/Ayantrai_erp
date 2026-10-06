import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

export function notFound(req: Request, res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl} - Endpoint not found`));
}
