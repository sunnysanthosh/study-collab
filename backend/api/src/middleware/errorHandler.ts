import { Request, Response, NextFunction } from 'express';
import { logError } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error with context
  logError(err, {
    request: {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      userId: req.user?.userId,
      body: req.body,
      query: req.query,
      params: req.params,
    },
    error: {
      statusCode: err.statusCode || 500,
      code: err.code,
      isOperational: err.isOperational,
    },
  });

  // Determine status code
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Prepare error response
  const errorResponse: any = {
    error: isOperational ? err.message : 'Internal server error',
    timestamp: new Date().toISOString(),
    path: req.originalUrl || req.url,
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.message = err.message;
    errorResponse.stack = err.stack;
    errorResponse.code = err.code;
  }

  // Add error ID for tracking (in production)
  if (process.env.NODE_ENV === 'production') {
    errorResponse.errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


