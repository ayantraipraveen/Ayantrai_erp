import { Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { AuthenticatedRequest } from '../types';

/**
 * Safely extracts authentication token from either:
 * 1. Secure httpOnly Cookie ('sitesafe_token')
 * 2. Authorization Bearer header ('Authorization: Bearer <token>')
 */
export function extractToken(req: AuthenticatedRequest): string | null {
  // 1. Try Cookie header (sitesafe_token)
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)sitesafe_token=([^;]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1].trim());
    }
  }

  // 2. Fallback to Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[1]) {
      return parts[1].trim();
    }
  }

  return null;
}

/**
 * Middleware: Requires a valid JWT session token via httpOnly Cookie or Authorization Bearer header
 */
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const token = extractToken(req);

  if (!token) {
    return next(ApiError.unauthorized('Authentication token missing. Please sign in.'));
  }

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
 * Middleware: Optional authentication.
 * If token is present in cookie or header, verifies and attaches user.
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const token = extractToken(req);

  if (token) {
    const decoded = verifyToken<JwtPayload>(token);
    if (decoded) {
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name || decoded.email,
        role: decoded.role || 'User',
        roleSlug: decoded.roleSlug || 'user',
        permissions: decoded.permissions || [],
      };
    }
  }

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
