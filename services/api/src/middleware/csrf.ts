import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { getCsrfToken, setCsrfToken } from '../utils/redis';

const DISABLE_CSRF = process.env.DISABLE_CSRF === 'true';

export const csrfProtection = async (req: Request, res: Response, next: NextFunction) => {
  if (DISABLE_CSRF) {
    return next();
  }
  const method = (req.method || '').toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return next();
  }
  const token = req.headers['x-csrf-token'] as string | undefined;
  if (!token || typeof token !== 'string') {
    return res.status(403).json({ error: 'CSRF token missing' });
  }
  const valid = await getCsrfToken(token);
  if (!valid) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next();
};

export const getNewCsrfToken = async (): Promise<string> => {
  const token = crypto.randomBytes(32).toString('hex');
  if (DISABLE_CSRF) return token;
  const ok = await setCsrfToken(token);
  if (!ok) throw new Error('CSRF token storage unavailable');
  return token;
};
