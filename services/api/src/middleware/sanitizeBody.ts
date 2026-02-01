import { Request, Response, NextFunction } from 'express';
import { sanitizeObject, sanitizeString } from '../utils/sanitize';

const DISABLE_SANITIZE = process.env.DISABLE_INPUT_SANITIZATION === 'true';

/**
 * Sanitize req.body and req.query string fields (trim, escape HTML, max length).
 * Skips password, token, etc. Apply after express.json().
 */
export function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  if (DISABLE_SANITIZE) {
    return next();
  }
  if (req.body != null && typeof req.body === 'object' && !Array.isArray(req.body)) {
    req.body = sanitizeObject(req.body as Record<string, unknown>);
  }
  if (req.query != null && typeof req.query === 'object') {
    const q = req.query as Record<string, unknown>;
    for (const [k, v] of Object.entries(q)) {
      if (typeof v === 'string') {
        q[k] = sanitizeString(v, 500);
      } else if (Array.isArray(v)) {
        q[k] = v.map((x) => (typeof x === 'string' ? sanitizeString(x, 500) : x));
      }
    }
  }
  next();
}
