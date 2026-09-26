import xss from 'xss';
import { z } from 'zod';

/**
 * OWASP Top 10: Cross-Site Scripting (XSS) Prevention
 * We use an XSS sanitizer to strip malicious HTML/JavaScript tags from any text input
 * before it hits the database or is processed by the AI.
 */
export function sanitizeInput(input: string): string {
  return xss(input, {
    whiteList: {}, // Empty whitelist means ALL HTML tags are stripped. Only plain text survives.
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'] // Completely remove script and style bodies
  });
}

/**
 * Zod helper that automatically sanitizes string inputs.
 * Usage: z.string().transform(sanitizeString)
 */
export const sanitizeString = (val: string) => sanitizeInput(val);
