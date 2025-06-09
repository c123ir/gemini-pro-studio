"use strict";
// backend/src/middleware/notFound.ts
// Middleware for handling 404 Not Found errors
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const logger_1 = require("../utils/logger");
/**
 * میدل‌ویر برای مدیریت درخواست‌هایی که با هیچ مسیری مطابقت ندارند
 * پاسخ 404 با پیام مناسب برمی‌گرداند
 */
const notFound = (req, res, next) => {
    logger_1.logger.warn(`404 - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(404).json({
        status: 'error',
        message: 'آدرس مورد نظر یافت نشد',
        path: req.originalUrl
    });
};
exports.notFound = notFound;
