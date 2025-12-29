"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = exports.CustomError = void 0;
const logger_1 = require("../utils/logger");
class CustomError extends Error {
    constructor(message, statusCode = 500, code) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
const errorHandler = (err, req, res, next) => {
    // Log error with context
    (0, logger_1.logError)(err, {
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
    const errorResponse = {
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
exports.errorHandler = errorHandler;
// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
