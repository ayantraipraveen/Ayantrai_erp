import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

/**
 * Route-level Method Not Allowed (HTTP 405) middleware handler.
 * Attaches RFC 7231 'Allow' header and returns standardized 405 error.
 *
 * Example:
 * router.all('/reorder', methodNotAllowed(['PUT']));
 */
export function methodNotAllowed(allowedMethods: string[] = ['GET']) {
  const allowedHeader = allowedMethods.map((m) => m.toUpperCase()).join(', ');

  return (req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('Allow', allowedHeader);
    next(
      ApiError.methodNotAllowed(
        `HTTP method '${req.method}' is not allowed for '${req.originalUrl}'`,
        allowedMethods
      )
    );
  };
}

export default methodNotAllowed;
