import { Request, Response, NextFunction } from 'express';
import { logRequest } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Override res.end to capture response time
  const originalEnd = res.end.bind(res);
  res.end = function (chunk?: any, encoding?: any): Response {
    const responseTime = Date.now() - startTime;
    logRequest(req, res, responseTime);
    return originalEnd(chunk, encoding);
  };

  next();
};

