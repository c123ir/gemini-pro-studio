// backend/src/middleware/auth.ts
// Authentication and Authorization Middleware
// Path: backend/src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db_config';
import { logger, LoggerUtils } from '../utils/logger';
import { ApiError } from '../utils/apiError';
import { UnauthorizedError, ForbiddenError } from '../utils/errorHandler';
import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

// Extend Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                username?: string;
                isPremium: boolean;
                role?: string;
            };
            apiKey?: {
                id: number;
                userId: number;
                name: string;
                provider: string;
            };
        }
    }
}

// JWT Token interfaces
interface JWTPayload {
    userId: number;
    email: string;
    isPremium: boolean;
    iat?: number;
    exp?: number;
}

interface RefreshTokenPayload {
    userId: number;
    tokenVersion: number;
    iat?: number;
    exp?: number;
}

// Authentication utilities
export class AuthUtils {
    // Generate JWT token
    static generateToken(user: any): string {
        const payload: JWTPayload = {
            userId: user.id,
            email: user.email,
            isPremium: user.isPremium || false
        };

        try {
            const secret = process.env.JWT_SECRET!;
            const options: SignOptions = { 
                expiresIn: (process.env.JWT_EXPIRE || '7d') as jwt.SignOptions['expiresIn'],
                issuer: 'gemini-pro-studio',
                audience: 'gemini-app'
            };
            return jwt.sign(payload, secret, options);
        } catch (error) {
            logger.error('Token generation error:', error);
            throw new Error('مشکل در ایجاد توکن');
        }
    }

    // Generate refresh token
    static generateRefreshToken(user: any): string {
        const payload: RefreshTokenPayload = {
            userId: user.id,
            tokenVersion: user.tokenVersion || 0
        };

        try {
            const secret = process.env.REFRESH_TOKEN_SECRET!;
            const options: SignOptions = { 
                expiresIn: (process.env.REFRESH_TOKEN_EXPIRE || '30d') as jwt.SignOptions['expiresIn'],
                issuer: 'gemini-pro-studio'
            };
            return jwt.sign(payload, secret, options);
        } catch (error) {
            logger.error('Refresh token generation error:', error);
            throw new Error('مشکل در ایجاد توکن');
        }
    }

    // Verify JWT token
    static verifyToken(token: string): JWTPayload {
        try {
            return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new ApiError('Token expired', 401);
            } else if (error instanceof jwt.JsonWebTokenError) {
                throw new ApiError('Invalid token', 401);
            }
            throw new ApiError('Token verification failed', 401);
        }
    }

    // Verify refresh token
    static verifyRefreshToken(token: string): RefreshTokenPayload {
        try {
            return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as RefreshTokenPayload;
        } catch (error) {
            throw new ApiError('Invalid refresh token', 401);
        }
    }

    // Hash password
    static async hashPassword(password: string): Promise<string> {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
        return await bcrypt.hash(password, saltRounds);
    }

    // Compare password
    static async comparePassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    // Extract token from header
    static extractTokenFromHeader(authHeader: string | undefined): string | null {
        if (!authHeader) return null;
        
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null;
        }
        
        return parts[1];
    }
}

// Authentication middleware
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);
        
        if (!token) {
            throw new ApiError('No token provided', 401);
        }

        // Verify token
        const decoded = AuthUtils.verifyToken(token);

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                username: true,
                isPremium: true,
                isActive: true,
                emailVerified: true
            }
        });

        if (!user) {
            throw new ApiError('User not found', 401);
        }

        if (!user.isActive) {
            throw new ApiError('Account is inactive', 401);
        }

        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            username: user.username || undefined,
            isPremium: user.isPremium
        };

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        // Log user activity
        LoggerUtils.logUserActivity(user.id, 'authentication_success', {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        next();
    } catch (error) {
        // Log failed authentication
        LoggerUtils.logSecurityEvent('authentication_failed', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 'medium');

        next(error);
    }
};

// Optional authentication (for public endpoints that can benefit from user context)
export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);
        
        if (token) {
            const decoded = AuthUtils.verifyToken(token);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    isPremium: true,
                    isActive: true
                }
            });

            if (user && user.isActive) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    username: user.username || undefined,
                    isPremium: user.isPremium
                };
            }
        }

        next();
    } catch (error) {
        // Don't throw error for optional auth, just continue without user
        next();
    }
};

// Admin authorization
export const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        throw new ApiError('Authentication required', 401);
    }

    if (req.user.role !== 'admin') {
        throw new ApiError('Admin access required', 403);
    }

    next();
};

// Premium user authorization
export const requirePremium = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        throw new ApiError('Authentication required', 401);
    }

    if (!req.user.isPremium) {
        throw new ApiError('Premium subscription required', 403);
    }

    next();
};

// Email verification requirement
export const requireEmailVerification = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new ApiError('Authentication required', 401);
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { emailVerified: true }
        });

        if (!user || !user.emailVerified) {
            throw new ApiError('Email verification required', 403);
        }

        next();
    } catch (error) {
        next(error);
    }
};

// API Key validation middleware
export const validateApiKey = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user) {
            throw new ApiError('Authentication required', 401);
        }

        // Check if user has any active API keys
        const apiKey = await prisma.apiKey.findFirst({
            where: {
                userId: req.user.id,
                isActive: true
            },
            select: {
                id: true,
                userId: true,
                name: true,
                provider: true,
                usageCount: true,
                usageLimit: true
            }
        });

        if (!apiKey) {
            throw new ApiError('No active API key found. Please add an API key in settings.', 400);
        }

        // Check usage limits
        if (apiKey.usageCount >= apiKey.usageLimit) {
            throw new ApiError('API key usage limit exceeded', 429);
        }

        req.apiKey = apiKey;
        next();
    } catch (error) {
        next(error);
    }
};

// Rate limiting by user
export const rateLimitByUser = (maxRequests: number, windowMs: number = 60000) => {
    const userRequestCounts = new Map<number, { count: number; resetTime: number }>();

    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            return next();
        }

        const userId = req.user.id;
        const now = Date.now();
        const userRecord = userRequestCounts.get(userId);

        if (!userRecord || now > userRecord.resetTime) {
            userRequestCounts.set(userId, {
                count: 1,
                resetTime: now + windowMs
            });
            return next();
        }

        if (userRecord.count >= maxRequests) {
            LoggerUtils.logSecurityEvent('rate_limit_exceeded', {
                userId,
                ip: req.ip,
                path: req.path,
                count: userRecord.count
            }, 'medium');
            
            throw new ApiError('Too many requests. Please try again later.', 429);
        }

        userRecord.count++;
        next();
    };
};

/**
 * میدل‌ویر احراز هویت
 * توکن JWT را بررسی کرده و اطلاعات کاربر را به req.user اضافه می‌کند
 */
export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // دریافت توکن از هدر Authorization
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'توکن احراز هویت الزامی است'
            });
        }

        // بررسی اعتبار توکن
        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'your-secret-key'
            ) as { userId: string };

            if (!decoded || !decoded.userId) {
                return res.status(401).json({
                    success: false,
                    message: 'توکن نامعتبر است'
                });
            }

            // دریافت اطلاعات کاربر
            const user = await prismaClient.user.findUnique({
                where: { id: Number(decoded.userId) },
                select: {
                    id: true,
                    email: true,
                    isActive: true,
                    role: true
                }
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'کاربر یافت نشد'
                });
            }

            if (!user.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'حساب کاربری شما غیرفعال شده است'
                });
            }

            // افزودن اطلاعات کاربر به درخواست
            req.user = {
                id: user.id,
                email: user.email,
                role: user.role || 'user',
                isPremium: false
            };

            next();
        } catch (jwtError) {
            if (jwtError instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({
                    success: false,
                    message: 'توکن نامعتبر است'
                });
            }

            if (jwtError instanceof jwt.TokenExpiredError) {
                return res.status(401).json({
                    success: false,
                    message: 'توکن منقضی شده است'
                });
            }

            throw jwtError;
        }
    } catch (error) {
        logger.error('Error in authenticateToken middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'خطای داخلی سرور'
        });
    }
};

/**
 * میدل‌ویر بررسی نقش کاربر
 * بررسی می‌کند آیا کاربر نقش مورد نیاز را دارد یا خیر
 */
export const checkRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'ابتدا باید احراز هویت شوید'
                });
            }

            const userRole = req.user.role || ''; // تبدیل به رشته خالی اگر undefined باشد
            if (!roles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'شما دسترسی لازم برای این عملیات را ندارید'
                });
            }

            next();
        } catch (error) {
            logger.error('Error in checkRole middleware:', error);
            return res.status(500).json({
                success: false,
                message: 'خطای داخلی سرور'
            });
        }
    };
};