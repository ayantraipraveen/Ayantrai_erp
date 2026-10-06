import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

export function notFound(req: Request, res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: [${req.method}] ${req.originalUrl}`));
}

export default notFound;
