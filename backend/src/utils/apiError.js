"use strict";
// src/utils/apiError.ts
// کلاس خطای سفارشی برای مدیریت خطاهای API
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message = 'درخواست نامعتبر است') {
        return new ApiError(message, 400);
    }
    static unauthorized(message = 'احراز هویت ناموفق بود') {
        return new ApiError(message, 401);
    }
    static forbidden(message = 'شما به این منبع دسترسی ندارید') {
        return new ApiError(message, 403);
    }
    static notFound(message = 'منبع درخواستی یافت نشد') {
        return new ApiError(message, 404);
    }
    static conflict(message = 'درخواست با داده‌های موجود تداخل دارد') {
        return new ApiError(message, 409);
    }
    static tooManyRequests(message = 'تعداد درخواست‌های شما بیش از حد مجاز است') {
        return new ApiError(message, 429);
    }
    static internal(message = 'خطای سرور داخلی') {
        return new ApiError(message, 500);
    }
}
exports.ApiError = ApiError;
