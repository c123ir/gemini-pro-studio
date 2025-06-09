"use strict";
// backend/src/middleware/rateLimiter.ts
// میدل‌ویر محدودیت نرخ درخواست (Rate Limiting)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("../utils/logger");
// تنظیمات پیش‌فرض
const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 دقیقه
    max: 100, // حداکثر 100 درخواست در هر پنجره زمانی
    standardHeaders: true, // اضافه کردن هدرهای استاندارد `RateLimit-*` (از نسخه 4 express-rate-limit به بعد)
    legacyHeaders: false, // اضافه نکردن هدرهای قدیمی `X-RateLimit-*`
    skipSuccessfulRequests: false, // تمام درخواست‌ها را شمارش کن
    handler: (req, res) => {
        logger_1.logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        return res.status(429).json({
            success: false,
            message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید.'
        });
    }
};
// Rate Limiter برای API‌های هوش مصنوعی
const aiLimiter = (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, defaultOptions), { windowMs: 60 * 1000, max: 10, message: {
        success: false,
        message: 'تعداد درخواست‌های AI بیش از حد مجاز است. لطفاً کمی صبر کنید.'
    } }));
// Rate Limiter برای احراز هویت
const authLimiter = (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, defaultOptions), { windowMs: 60 * 60 * 1000, max: 20, message: {
        success: false,
        message: 'تعداد درخواست‌های احراز هویت بیش از حد مجاز است. لطفاً بعداً تلاش کنید.'
    } }));
// Rate Limiter برای تغییر رمز عبور
const passwordLimiter = (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, defaultOptions), { windowMs: 60 * 60 * 1000, max: 5, message: {
        success: false,
        message: 'تعداد درخواست‌های تغییر رمز عبور بیش از حد مجاز است. لطفاً بعداً تلاش کنید.'
    } }));
// Rate Limiter برای آپلود فایل
const uploadLimiter = (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, defaultOptions), { windowMs: 10 * 60 * 1000, max: 20, message: {
        success: false,
        message: 'تعداد فایل‌های آپلود شده بیش از حد مجاز است. لطفاً کمی صبر کنید.'
    } }));
// Rate Limiter عمومی برای سایر درخواست‌ها
const generalLimiter = (0, express_rate_limit_1.default)(Object.assign({}, defaultOptions));
// صادر کردن انواع مختلف Rate Limiter
exports.rateLimiter = {
    ai: aiLimiter,
    auth: authLimiter,
    password: passwordLimiter,
    upload: uploadLimiter,
    general: generalLimiter
};
