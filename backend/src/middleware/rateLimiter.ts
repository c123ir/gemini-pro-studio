// backend/src/middleware/rateLimiter.ts
// میدل‌ویر محدودیت نرخ درخواست (Rate Limiting)

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { logger } from '../utils/logger';
import { getRedisClient } from '../config/redis';

// تنظیمات پیش‌فرض
const defaultOptions = {
  windowMs: 15 * 60 * 1000, // 15 دقیقه
  max: 100, // حداکثر 100 درخواست در هر پنجره زمانی
  standardHeaders: true, // اضافه کردن هدرهای استاندارد `RateLimit-*` (از نسخه 4 express-rate-limit به بعد)
  legacyHeaders: false, // اضافه نکردن هدرهای قدیمی `X-RateLimit-*`
  skipSuccessfulRequests: false, // تمام درخواست‌ها را شمارش کن
  handler: (req: any, res: any) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    return res.status(429).json({
      success: false,
      message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید.'
    });
  }
};

// Rate Limiter برای API‌های هوش مصنوعی
const aiLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 1000, // 1 دقیقه
  max: 10, // حداکثر 10 درخواست در دقیقه
  message: {
    success: false,
    message: 'تعداد درخواست‌های AI بیش از حد مجاز است. لطفاً کمی صبر کنید.'
  }
});

// Rate Limiter برای احراز هویت
const authLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 60 * 1000, // 1 ساعت
  max: 20, // حداکثر 20 درخواست در ساعت
  message: {
    success: false,
    message: 'تعداد درخواست‌های احراز هویت بیش از حد مجاز است. لطفاً بعداً تلاش کنید.'
  }
});

// Rate Limiter برای تغییر رمز عبور
const passwordLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 60 * 1000, // 1 ساعت
  max: 5, // حداکثر 5 درخواست در ساعت
  message: {
    success: false,
    message: 'تعداد درخواست‌های تغییر رمز عبور بیش از حد مجاز است. لطفاً بعداً تلاش کنید.'
  }
});

// Rate Limiter برای آپلود فایل
const uploadLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 10 * 60 * 1000, // 10 دقیقه
  max: 20, // حداکثر 20 آپلود در 10 دقیقه
  message: {
    success: false,
    message: 'تعداد فایل‌های آپلود شده بیش از حد مجاز است. لطفاً کمی صبر کنید.'
  }
});

// Rate Limiter عمومی برای سایر درخواست‌ها
const generalLimiter = rateLimit({
  ...defaultOptions
});

// صادر کردن انواع مختلف Rate Limiter
export const rateLimiter = {
  ai: aiLimiter,
  auth: authLimiter,
  password: passwordLimiter,
  upload: uploadLimiter,
  general: generalLimiter
}; 