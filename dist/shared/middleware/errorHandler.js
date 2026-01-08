"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.asyncHandler = exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errorHandler = (error, req, res, next) => {
    const { statusCode = 500, message } = error;
    logger_1.logger.error(`Error ${statusCode}: ${message}`, {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        stack: error.stack
    });
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(statusCode).json({
        success: false,
        error: {
            message: isDevelopment ? message : 'Đã xảy ra lỗi hệ thống',
            ...(isDevelopment && { stack: error.stack })
        },
        timestamp: new Date().toISOString()
    });
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
        this.isOperational = true;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends Error {
    constructor(message = 'Không tìm thấy tài nguyên') {
        super(message);
        this.statusCode = 404;
        this.isOperational = true;
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends Error {
    constructor(message = 'Không có quyền truy cập') {
        super(message);
        this.statusCode = 401;
        this.isOperational = true;
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
