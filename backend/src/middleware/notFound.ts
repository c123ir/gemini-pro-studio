// backend/src/middleware/notFound.ts
// Middleware for handling 404 Not Found errors

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * میدل‌ویر برای مدیریت درخواست‌هایی که با هیچ مسیری مطابقت ندارند
 * پاسخ 404 با پیام مناسب برمی‌گرداند
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  logger.warn(`404 - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  res.status(404).json({
    status: 'error',
    message: 'آدرس مورد نظر یافت نشد',
    path: req.originalUrl
  });
}; 