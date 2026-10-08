import { ApiError } from './apiError';

/**
 * Enterprise SVG Sanitizer
 * Strips active scripting elements, inline event handlers, and malicious payloads
 * from SVG vector strings to prevent Stored Cross-Site Scripting (XSS) and XXE attacks.
 */
export function sanitizeSvg(rawSvg: string): string {
  if (!rawSvg || typeof rawSvg !== 'string') {
    throw ApiError.badRequest('Invalid SVG content provided.');
  }

  let sanitized = rawSvg;

  // 1. Prevent XXE (XML External Entity) attacks
  if (/<!entity/i.test(sanitized) || /<!doctype[^>]*system/i.test(sanitized)) {
    throw ApiError.badRequest('Security violation: External XML entities or DTDs are not permitted in SVG.');
  }

  // 2. Remove XML comments containing potentially hidden payloads
  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');

  // 3. Remove executable tags: <script>, <foreignObject>, <iframe>, <object>, <embed>, <applet>
  sanitized = sanitized.replace(/<script[\s\S]*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<script[^>]*\/>/gi, '');
  sanitized = sanitized.replace(/<foreignobject[\s\S]*?<\/foreignobject>/gi, '');
  sanitized = sanitized.replace(/<foreignobject[^>]*\/>/gi, '');
  sanitized = sanitized.replace(/<iframe[\s\S]*?<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object[\s\S]*?<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed[\s\S]*?<\/embed>/gi, '');
  sanitized = sanitized.replace(/<applet[\s\S]*?<\/applet>/gi, '');

  // 4. Remove all inline event handlers (e.g. onload="...", onclick='...', onerror=...)
  sanitized = sanitized.replace(/\s+on[a-z]+\s*=\s*(['\"][^'\"]*['\"]|[^\s>]+)/gi, '');

  // 5. Remove javascript: and vbscript: URIs from href, xlink:href, src, etc.
  sanitized = sanitized.replace(
    /(href|xlink:href|src)\s*=\s*(['\"])\s*(javascript|vbscript|data:text\/html):[^'\"]*\2/gi,
    '$1=""'
  );

  // 6. Neutralize expressions or javascript URLs within style attributes and <style> tags
  sanitized = sanitized.replace(/expression\s*\([^)]*\)/gi, 'none');
  sanitized = sanitized.replace(/url\s*\(\s*(['\"]?)\s*javascript:[^)]*\1\s*\)/gi, 'none');

  // 7. Prevent SSRF (Server-Side Request Forgery) via external resource links
  // Disallow remote http/https/file/ftp references in href, xlink:href, src
  sanitized = sanitized.replace(
    /(href|xlink:href|src)\s*=\s*(['\"])\s*(https?|file|ftp|gopher|dict):[^'\"]*\2/gi,
    '$1=""'
  );

  // Disallow external CSS @import directives inside <style> tags
  sanitized = sanitized.replace(/@import\s+[^;]+;/gi, '');

  // Strip external <image> and <feImage> elements pointing to remote resources
  sanitized = sanitized.replace(/<image[^>]*(href|xlink:href)\s*=\s*['\"](https?|file|ftp):[^'\"]*['\"][^>]*\/?>/gi, '');
  sanitized = sanitized.replace(/<feimage[^>]*(href|xlink:href)\s*=\s*['\"](https?|file|ftp):[^'\"]*['\"][^>]*\/?>/gi, '');

  // 8. Verify the output still contains valid SVG envelope
  if (!sanitized.includes('<svg') || !sanitized.includes('</svg>')) {
    throw ApiError.badRequest('Provided content is not valid SVG markup.');
  }

  return sanitized.trim();
}
