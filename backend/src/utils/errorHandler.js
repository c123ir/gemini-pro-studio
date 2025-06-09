"use strict";
// backend/src/utils/errorHandler.ts
// ابزار مدیریت خطاها
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.ServerError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.ApiError = void 0;
const logger_1 = require("./logger");
/**
 * کلاس پایه برای خطاهای API
 */
class ApiError extends Error {
    constructor(message, statusCode = 500, errors) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
/**
 * خطای درخواست نامعتبر (400)
 */
class BadRequestError extends ApiError {
    constructor(message = 'درخواست نامعتبر', errors) {
        super(message, 400, errors);
    }
}
exports.BadRequestError = BadRequestError;
/**
 * خطای احراز هویت (401)
 */
class UnauthorizedError extends ApiError {
    constructor(message = 'احراز هویت نامعتبر') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
/**
 * خطای عدم دسترسی (403)
 */
class ForbiddenError extends ApiError {
    constructor(message = 'دسترسی به این منبع ممنوع است') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
/**
 * خطای منبع یافت نشد (404)
 */
class NotFoundError extends ApiError {
    constructor(message = 'منبع درخواستی یافت نشد') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * خطای تعارض (409)
 */
class ConflictError extends ApiError {
    constructor(message = 'تعارض در منابع') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
/**
 * خطای سرور (500)
 */
class ServerError extends ApiError {
    constructor(message = 'خطای داخلی سرور') {
        super(message, 500);
    }
}
exports.ServerError = ServerError;
/**
 * تابع کمکی برای پردازش خطاها و ارسال پاسخ مناسب
 */
const handleError = (res, error) => {
    var _a;
    // اگر خطا از نوع ApiError باشد
    if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message,
            errors: error.errors
        });
    }
    // خطاهای Prisma
    if (error.code && error.code.startsWith('P')) {
        logger_1.logger.error(`Prisma Error: ${error.code}`, error);
        // خطای عدم وجود رکورد
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'منبع درخواستی یافت نشد'
            });
        }
        // خطای نقض محدودیت یکتایی
        if (error.code === 'P2002') {
            return res.status(409).json({
                success: false,
                message: `مقدار ${(_a = error.meta) === null || _a === void 0 ? void 0 : _a.target} تکراری است`
            });
        }
    }
    // خطاهای عمومی
    logger_1.logger.error('Unexpected error:', error);
    // پیام خطای پیش‌فرض
    const message = error.message || 'خطای داخلی سرور';
    return res.status(500).json({
        success: false,
        message
    });
};
exports.handleError = handleError;
