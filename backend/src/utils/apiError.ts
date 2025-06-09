// src/utils/apiError.ts
// کلاس خطای سفارشی برای مدیریت خطاهای API

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  status: string;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string = 'درخواست نامعتبر است'): ApiError {
    return new ApiError(message, 400);
  }

  static unauthorized(message: string = 'احراز هویت ناموفق بود'): ApiError {
    return new ApiError(message, 401);
  }

  static forbidden(message: string = 'شما به این منبع دسترسی ندارید'): ApiError {
    return new ApiError(message, 403);
  }

  static notFound(message: string = 'منبع درخواستی یافت نشد'): ApiError {
    return new ApiError(message, 404);
  }

  static conflict(message: string = 'درخواست با داده‌های موجود تداخل دارد'): ApiError {
    return new ApiError(message, 409);
  }

  static tooManyRequests(message: string = 'تعداد درخواست‌های شما بیش از حد مجاز است'): ApiError {
    return new ApiError(message, 429);
  }

  static internal(message: string = 'خطای سرور داخلی'): ApiError {
    return new ApiError(message, 500);
  }
} 