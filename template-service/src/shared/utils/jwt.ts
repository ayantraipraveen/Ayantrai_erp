import crypto from 'crypto';
import { env } from '../../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
  name?: string;
  role?: string;
  roleSlug?: string;
  permissions?: string[];
  type?: string;
  [key: string]: any;
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Stateless verification of JWT token issued by the Auth Service.
 * Verifies HS256 signature against shared JWT_SECRET.
 */
export function verifyToken<T = JwtPayload>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify cryptographic HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', env.JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature !== expectedSignature) {
      return null;
    }

    // Parse payload and check expiration
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload as T;
  } catch (err) {
    return null;
  }
}
