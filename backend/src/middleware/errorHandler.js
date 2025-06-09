"use strict";
// backend/src/middleware/errorHandler.ts
// Global error handler middleware
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("../utils/logger");
// Custom Error class with status code
class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Global error handler
const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'خطای داخلی سرور';
    let isOperational = false;
    // Check if this is an instance of our AppError
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        isOperational = err.isOperational;
    }
    // Customize the error response based on specific errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'خطای اعتبارسنجی';
        isOperational = true;
    }
    else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'دسترسی غیرمجاز';
        isOperational = true;
    }
    else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'توکن نامعتبر یا منقضی شده';
        isOperational = true;
    }
    // Log error
    if (isOperational) {
        logger_1.logger.warn(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    }
    else {
        logger_1.logger.error(`${err.name}: ${err.message}`, { stack: err.stack });
    }
    // Operational, trusted error: send message to client
    const response = Object.assign({ status: 'error', message }, (process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        name: err.name,
    }));
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
