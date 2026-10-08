import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ApiError } from '../utils/apiError';

interface RateLimitRecord {
  count: number;
  resetTime: number; // Unix timestamp in ms
}

interface RateLimitOptions {
  windowMs: number; // Duration of window in ms
  max: number; // Maximum allowed requests within window
  message?: string;
  skipFailedRequests?: boolean;
}

/**
 * In-memory sliding-window rate limiter
 * Protects endpoints against denial-of-service, automated scraping, and brute force flooding.
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests. Please slow down and try again later.',
  } = options;

  const storage = new Map<string, RateLimitRecord>();

  // Periodic garbage collection to ensure memory never leaks
  const gcInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of storage.entries()) {
      if (now > record.resetTime) {
        storage.delete(key);
      }
    }
  }, Math.max(windowMs, 60000));

  // Allow Node process to exit cleanly without keeping event loop alive for timer
  if (gcInterval.unref) {
    gcInterval.unref();
  }

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const now = Date.now();

    // Generate unique client key based on user ID or IP
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

    // Standard RFC RateLimit headers
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
  windowMs: 60 * 1000, // 1 minute
  max: 180,
  message: 'Too many API requests from this client.',
});

/**
 * Mutation rate limiter (POST/PUT/DELETE): 50 requests per minute per client
 */
export const mutationLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 50,
  message: 'Too many creation or modification requests.',
});
