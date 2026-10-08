import { Request, Response, NextFunction } from 'express';
import dns from 'dns';
import net from 'net';
import { ApiError } from '../utils/apiError';

/**
 * Checks if an IP address belongs to private, loopback, link-local,
 * cloud metadata (AWS/GCP/Azure 169.254.169.254), or reserved subnets.
 */
export function isPrivateOrReservedIp(rawIp: string): boolean {
  let ip = rawIp.trim();

  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  const isV4 = net.isIPv4(ip);
  const isV6 = net.isIPv6(ip);

  if (!isV4 && !isV6) return true;

  if (isV4) {
    const parts = ip.split('.').map((p) => parseInt(p, 10));
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return true;
    }

    const [a, b, c, d] = parts;
    if (a === 0) return true;
    if (a === 127) return true;
    if (a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a === 198 && (b === 18 || b === 19)) return true;
    if (a >= 224 && a <= 239) return true;
    if (a >= 240) return true;
    if (a === 255 && b === 255 && c === 255 && d === 255) return true;

    return false;
  }

  if (isV6) {
    const lower = ip.toLowerCase();
    if (lower === '::1' || lower === '::') return true;
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
    if (
      lower.startsWith('fe8') ||
      lower.startsWith('fe9') ||
      lower.startsWith('fea') ||
      lower.startsWith('feb')
    ) {
      return true;
    }
    if (lower.startsWith('ff')) return true;

    return false;
  }

  return true;
}

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '::1',
  '0.0.0.0',
  'metadata.google.internal',
  '169.254.169.254',
  'instance-data',
]);

const BLOCKED_PORTS = new Set([
  22, 23, 25, 53, 110, 143, 445, 1433, 1521, 2375, 2376, 3306, 3389,
  5000, 5001, 5432, 6379, 8080, 8443, 9000, 9200, 11211, 27017, 28017,
]);

/**
 * Validates whether an external URL is safe to fetch or reference,
 * blocking Server-Side Request Forgery (SSRF) against private/internal endpoints.
 */
export async function validateSafeUrl(
  urlString: string
): Promise<{ safe: boolean; reason?: string }> {
  try {
    let parsed: URL;
    try {
      parsed = new URL(urlString);
    } catch {
      return { safe: false, reason: 'Malformed URL provided.' };
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        safe: false,
        reason: `Disallowed protocol '${parsed.protocol}'. Only http and https are permitted.`,
      };
    }

    const hostname = parsed.hostname.toLowerCase().trim();

    if (
      BLOCKED_HOSTNAMES.has(hostname) ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return { safe: false, reason: `Disallowed internal hostname '${hostname}'.` };
    }

    const port = parsed.port
      ? parseInt(parsed.port, 10)
      : parsed.protocol === 'https:'
      ? 443
      : 80;

    if (BLOCKED_PORTS.has(port)) {
      return { safe: false, reason: `Disallowed internal/restricted port '${port}'.` };
    }

    if (net.isIP(hostname)) {
      if (isPrivateOrReservedIp(hostname)) {
        return {
          safe: false,
          reason: `Direct access to private/reserved IP '${hostname}' is prohibited.`,
        };
      }
      return { safe: true };
    }

    try {
      const records = await dns.promises.lookup(hostname, { all: true });
      for (const record of records) {
        if (isPrivateOrReservedIp(record.address)) {
          return {
            safe: false,
            reason: `Host '${hostname}' resolves to private/internal IP '${record.address}'.`,
          };
        }
      }
    } catch (dnsErr: any) {
      return {
        safe: false,
        reason: `DNS resolution failed for '${hostname}': ${dnsErr.message}`,
      };
    }

    return { safe: true };
  } catch (err: any) {
    return { safe: false, reason: err.message };
  }
}

function extractPotentialUrls(value: any, results: string[] = []): string[] {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('file://') ||
      trimmed.startsWith('gopher://') ||
      trimmed.startsWith('ftp://')
    ) {
      results.push(trimmed);
    }
  } else if (Array.isArray(value)) {
    for (const item of value) {
      extractPotentialUrls(item, results);
    }
  } else if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      extractPotentialUrls(value[key], results);
    }
  }
  return results;
}

/**
 * Express Middleware: Blocks Server-Side Request Forgery (SSRF) in request payloads
 */
export async function ssrfProtection(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const urlsToValidate = [
      ...extractPotentialUrls(req.query),
      ...extractPotentialUrls(req.body),
    ];

    for (const urlStr of urlsToValidate) {
      const result = await validateSafeUrl(urlStr);
      if (!result.safe) {
        return next(
          ApiError.badRequest(
            `SSRF Security Violation: ${result.reason || 'URL targets a private or restricted network address.'}`
          )
        );
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}

export default ssrfProtection;
