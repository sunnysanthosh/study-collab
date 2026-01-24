import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    let metaStr = '';
    if (Object.keys(meta).length > 0 && meta.constructor === Object) {
      metaStr = '\n' + JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Custom format for file output (JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  }),
];

// File transports (only in production or when LOG_TO_FILE is enabled)
if (process.env.NODE_ENV === 'production' || process.env.LOG_TO_FILE === 'true') {
  // Error log file (daily rotation)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '14d', // Keep 14 days of logs
      zippedArchive: true,
    })
  );

  // Combined log file (all levels)
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '30d', // Keep 30 days of logs
      zippedArchive: true,
    })
  );

  // HTTP access log
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'http-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '7d', // Keep 7 days of HTTP logs
      zippedArchive: true,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: fileFormat,
  transports,
  // Handle exceptions and rejections
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join(logsDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    }),
  ],
  exitOnError: false,
});

// Helper functions for structured logging
export const logError = (error: Error | string, context?: Record<string, any>) => {
  if (error instanceof Error) {
    logger.error(error.message, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...context,
    });
  } else {
    logger.error(error, context);
  }
};

export const logWarning = (message: string, context?: Record<string, any>) => {
  logger.warn(message, context);
};

export const logInfo = (message: string, context?: Record<string, any>) => {
  logger.info(message, context);
};

export const logHttp = (message: string, context?: Record<string, any>) => {
  logger.http(message, context);
};

export const logDebug = (message: string, context?: Record<string, any>) => {
  logger.debug(message, context);
};

// Request logging helper
export const logRequest = (req: any, res: any, responseTime?: number) => {
  const logData: Record<string, any> = {
    method: req.method,
    url: req.originalUrl || req.url,
    statusCode: res.statusCode,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
  };

  if (responseTime) {
    logData.responseTime = `${responseTime}ms`;
  }

  if (req.user) {
    logData.userId = req.user.userId;
    logData.userEmail = req.user.email;
  }

  if (req.body && Object.keys(req.body).length > 0 && req.method !== 'GET') {
    // Log request body (sanitize sensitive data)
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.password_hash) sanitizedBody.password_hash = '[REDACTED]';
    if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
    logData.body = sanitizedBody;
  }

  if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.http('HTTP Request', logData);
  }
};

// Database query logging helper
export const logQuery = (query: string, params?: any[], duration?: number, error?: Error) => {
  const logData: Record<string, any> = {
    query: query.substring(0, 200), // Truncate long queries
    params: params ? params.map(p => (typeof p === 'string' && p.length > 50 ? p.substring(0, 50) + '...' : p)) : undefined,
  };

  if (duration) {
    logData.duration = `${duration}ms`;
  }

  if (error) {
    logger.error('Database Query Error', {
      ...logData,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
  } else {
    logger.debug('Database Query', logData);
  }
};

// Performance logging helper
export const logPerformance = (operation: string, duration: number, context?: Record<string, any>) => {
  if (duration > 1000) {
    logger.warn('Slow Operation', {
      operation,
      duration: `${duration}ms`,
      ...context,
    });
  } else {
    logger.debug('Performance', {
      operation,
      duration: `${duration}ms`,
      ...context,
    });
  }
};

export default logger;

