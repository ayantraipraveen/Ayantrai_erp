import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ApiError } from '../utils/apiError';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

/**
 * In-memory sliding-window rate limiter
 * Protects Auth and ERP endpoints against brute force and DoS flooding.
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests. Please slow down and try again later.',
  } = options;

  const storage = new Map<string, RateLimitRecord>();

  const gcInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of storage.entries()) {
      if (now > record.resetTime) {
        storage.delete(key);
      }
    }
  }, Math.max(windowMs, 60000));

  if (gcInterval.unref) {
    gcInterval.unref();
  }

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const now = Date.now();

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      req.ip ||
      'unknown';
    const key = req.user?.id ? `usr:${req.user.id}` : `ip:${clientIp}`;

    let record = storage.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      storage.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      return next(
        ApiError.tooManyRequests(
          `${message} (Rate limit exceeded. Try again in ${resetSeconds}s)`
        )
      );
    }

    next();
  };
}

/**
 * Global API rate limiter: 180 requests per minute per client
 */
export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 180,
  message: 'Too many API requests from this client.',
});

/**
 * Auth rate limiter (login / token endpoints): 20 attempts per minute to mitigate brute force
 */
export const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts. Please wait a minute before retrying.',
});
