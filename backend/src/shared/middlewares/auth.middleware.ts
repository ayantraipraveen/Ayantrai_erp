import { Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { AuthenticatedRequest } from '../types';

/**
 * Middleware: Requires a valid Bearer JWT token in Authorization header
 */
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Authentication token missing. Please sign in.'));
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken<JwtPayload>(token);

  if (!decoded) {
    return next(ApiError.unauthorized('Invalid or expired authentication token. Please sign in again.'));
  }

  // Attach decoded user payload to request
  req.user = {
    id: decoded.userId,
    email: decoded.email,
    name: decoded.name || decoded.email,
    role: decoded.role || 'User',
    roleSlug: decoded.roleSlug || 'user',
    permissions: decoded.permissions || [],
  };

  next();
}

/**
 * Middleware: Requires a specific permission slug (e.g. 'templates:create')
 */
export function requirePermission(requiredPermission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Please authenticate first.'));
    }

    // Superadmin always bypasses permission checks
    if (req.user.roleSlug === 'superadmin') {
      return next();
    }

    const hasPermission = req.user.permissions?.includes(requiredPermission);
    if (!hasPermission) {
      return next(
        ApiError.forbidden(
          `Access denied. You do not have the required permission: '${requiredPermission}'`
        )
      );
    }

    next();
  };
}

/**
 * Middleware: Requires a specific role slug (e.g. 'superadmin', 'site_admin')
 */
export function requireRole(...allowedRoleSlugs: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Please authenticate first.'));
    }

    if (!allowedRoleSlugs.includes(req.user.roleSlug)) {
      return next(
        ApiError.forbidden(
          `Access denied. This action requires one of the following roles: ${allowedRoleSlugs.join(', ')}`
        )
      );
    }

    next();
  };
}
