// backend/src/utils/errorHandler.ts
// ابزار مدیریت خطاها

import { Response } from 'express';
import { logger } from './logger';

/**
 * کلاس پایه برای خطاهای API
 */
export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string>;

  constructor(message: string, statusCode: number = 500, errors?: Record<string, string>) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * خطای درخواست نامعتبر (400)
 */
export class BadRequestError extends ApiError {
  constructor(message: string = 'درخواست نامعتبر', errors?: Record<string, string>) {
    super(message, 400, errors);
  }
}

/**
 * خطای احراز هویت (401)
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'احراز هویت نامعتبر') {
    super(message, 401);
  }
}

/**
 * خطای عدم دسترسی (403)
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'دسترسی به این منبع ممنوع است') {
    super(message, 403);
  }
}

/**
 * خطای منبع یافت نشد (404)
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'منبع درخواستی یافت نشد') {
    super(message, 404);
  }
}

/**
 * خطای تعارض (409)
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'تعارض در منابع') {
    super(message, 409);
  }
}

/**
 * خطای سرور (500)
 */
export class ServerError extends ApiError {
  constructor(message: string = 'خطای داخلی سرور') {
    super(message, 500);
  }
}

/**
 * تابع کمکی برای پردازش خطاها و ارسال پاسخ مناسب
 */
export const handleError = (res: Response, error: any): Response => {
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
    logger.error(`Prisma Error: ${error.code}`, error);
    
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
        message: `مقدار ${error.meta?.target} تکراری است`
      });
    }
  }

  // خطاهای عمومی
  logger.error('Unexpected error:', error);
  
  // پیام خطای پیش‌فرض
  const message = error.message || 'خطای داخلی سرور';
  
  return res.status(500).json({
    success: false,
    message
  });
}; 