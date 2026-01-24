import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { isTokenBlacklisted } from '../models/TokenBlacklist';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const payload = verifyAccessToken(token);
      const isBlacklisted = await isTokenBlacklisted(token);
      if (isBlacklisted) {
        return res.status(401).json({ error: 'Token has been revoked' });
      }
      req.user = payload;
      next();
    } catch (error: any) {
      return res.status(401).json({ error: error.message || 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const payload = verifyAccessToken(token);
        const isBlacklisted = await isTokenBlacklisted(token);
        req.user = isBlacklisted ? undefined : payload;
      } catch (error) {
        // Token invalid, but continue without user
        req.user = undefined;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};
