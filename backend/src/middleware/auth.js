"use strict";
// backend/src/middleware/auth.ts
// Authentication and Authorization Middleware
// Path: backend/src/middleware/auth.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.authenticateToken = exports.rateLimitByUser = exports.validateApiKey = exports.requireEmailVerification = exports.requirePremium = exports.requireAdmin = exports.optionalAuth = exports.authenticate = exports.AuthUtils = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_config_1 = require("../config/db_config");
const logger_1 = require("../utils/logger");
const apiError_1 = require("../utils/apiError");
const client_1 = require("@prisma/client");
const prismaClient = new client_1.PrismaClient();
// Authentication utilities
class AuthUtils {
    // Generate JWT token
    static generateToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            isPremium: user.isPremium || false
        };
        try {
            const secret = process.env.JWT_SECRET;
            const options = {
                expiresIn: (process.env.JWT_EXPIRE || '7d'),
                issuer: 'gemini-pro-studio',
                audience: 'gemini-app'
            };
            return jsonwebtoken_1.default.sign(payload, secret, options);
        }
        catch (error) {
            logger_1.logger.error('Token generation error:', error);
            throw new Error('مشکل در ایجاد توکن');
        }
    }
    // Generate refresh token
    static generateRefreshToken(user) {
        const payload = {
            userId: user.id,
            tokenVersion: user.tokenVersion || 0
        };
        try {
            const secret = process.env.REFRESH_TOKEN_SECRET;
            const options = {
                expiresIn: (process.env.REFRESH_TOKEN_EXPIRE || '30d'),
                issuer: 'gemini-pro-studio'
            };
            return jsonwebtoken_1.default.sign(payload, secret, options);
        }
        catch (error) {
            logger_1.logger.error('Refresh token generation error:', error);
            throw new Error('مشکل در ایجاد توکن');
        }
    }
    // Verify JWT token
    static verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new apiError_1.ApiError('Token expired', 401);
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new apiError_1.ApiError('Invalid token', 401);
            }
            throw new apiError_1.ApiError('Token verification failed', 401);
        }
    }
    // Verify refresh token
    static verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
        }
        catch (error) {
            throw new apiError_1.ApiError('Invalid refresh token', 401);
        }
    }
    // Hash password
    static hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
            return yield bcryptjs_1.default.hash(password, saltRounds);
        });
    }
    // Compare password
    static comparePassword(password, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcryptjs_1.default.compare(password, hash);
        });
    }
    // Extract token from header
    static extractTokenFromHeader(authHeader) {
        if (!authHeader)
            return null;
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null;
        }
        return parts[1];
    }
}
exports.AuthUtils = AuthUtils;
// Authentication middleware
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);
        if (!token) {
            throw new apiError_1.ApiError('No token provided', 401);
        }
        // Verify token
        const decoded = AuthUtils.verifyToken(token);
        // Get user from database
        const user = yield db_config_1.prisma.user.findUnique({
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
            throw new apiError_1.ApiError('User not found', 401);
        }
        if (!user.isActive) {
            throw new apiError_1.ApiError('Account is inactive', 401);
        }
        // Attach user to request
        req.user = {
            id: user.id,
            email: user.email,
            username: user.username || undefined,
            isPremium: user.isPremium
        };
        // Update last login
        yield db_config_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });
        // Log user activity
        logger_1.LoggerUtils.logUserActivity(user.id, 'authentication_success', {
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });
        next();
    }
    catch (error) {
        // Log failed authentication
        logger_1.LoggerUtils.logSecurityEvent('authentication_failed', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 'medium');
        next(error);
    }
});
exports.authenticate = authenticate;
// Optional authentication (for public endpoints that can benefit from user context)
const optionalAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);
        if (token) {
            const decoded = AuthUtils.verifyToken(token);
            const user = yield db_config_1.prisma.user.findUnique({
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
    }
    catch (error) {
        // Don't throw error for optional auth, just continue without user
        next();
    }
});
exports.optionalAuth = optionalAuth;
// Admin authorization
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        throw new apiError_1.ApiError('Authentication required', 401);
    }
    if (req.user.role !== 'admin') {
        throw new apiError_1.ApiError('Admin access required', 403);
    }
    next();
};
exports.requireAdmin = requireAdmin;
// Premium user authorization
const requirePremium = (req, res, next) => {
    if (!req.user) {
        throw new apiError_1.ApiError('Authentication required', 401);
    }
    if (!req.user.isPremium) {
        throw new apiError_1.ApiError('Premium subscription required', 403);
    }
    next();
};
exports.requirePremium = requirePremium;
// Email verification requirement
const requireEmailVerification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            throw new apiError_1.ApiError('Authentication required', 401);
        }
        const user = yield db_config_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: { emailVerified: true }
        });
        if (!user || !user.emailVerified) {
            throw new apiError_1.ApiError('Email verification required', 403);
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.requireEmailVerification = requireEmailVerification;
// API Key validation middleware
const validateApiKey = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            throw new apiError_1.ApiError('Authentication required', 401);
        }
        // Check if user has any active API keys
        const apiKey = yield db_config_1.prisma.apiKey.findFirst({
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
            throw new apiError_1.ApiError('No active API key found. Please add an API key in settings.', 400);
        }
        // Check usage limits
        if (apiKey.usageCount >= apiKey.usageLimit) {
            throw new apiError_1.ApiError('API key usage limit exceeded', 429);
        }
        req.apiKey = apiKey;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateApiKey = validateApiKey;
// Rate limiting by user
const rateLimitByUser = (maxRequests, windowMs = 60000) => {
    const userRequestCounts = new Map();
    return (req, res, next) => {
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
            logger_1.LoggerUtils.logSecurityEvent('rate_limit_exceeded', {
                userId,
                ip: req.ip,
                path: req.path,
                count: userRecord.count
            }, 'medium');
            throw new apiError_1.ApiError('Too many requests. Please try again later.', 429);
        }
        userRecord.count++;
        next();
    };
};
exports.rateLimitByUser = rateLimitByUser;
/**
 * میدل‌ویر احراز هویت
 * توکن JWT را بررسی کرده و اطلاعات کاربر را به req.user اضافه می‌کند
 */
const authenticateToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            if (!decoded || !decoded.userId) {
                return res.status(401).json({
                    success: false,
                    message: 'توکن نامعتبر است'
                });
            }
            // دریافت اطلاعات کاربر
            const user = yield prismaClient.user.findUnique({
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
        }
        catch (jwtError) {
            if (jwtError instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return res.status(401).json({
                    success: false,
                    message: 'توکن نامعتبر است'
                });
            }
            if (jwtError instanceof jsonwebtoken_1.default.TokenExpiredError) {
                return res.status(401).json({
                    success: false,
                    message: 'توکن منقضی شده است'
                });
            }
            throw jwtError;
        }
    }
    catch (error) {
        logger_1.logger.error('Error in authenticateToken middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'خطای داخلی سرور'
        });
    }
});
exports.authenticateToken = authenticateToken;
/**
 * میدل‌ویر بررسی نقش کاربر
 * بررسی می‌کند آیا کاربر نقش مورد نیاز را دارد یا خیر
 */
const checkRole = (roles) => {
    return (req, res, next) => {
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
        }
        catch (error) {
            logger_1.logger.error('Error in checkRole middleware:', error);
            return res.status(500).json({
                success: false,
                message: 'خطای داخلی سرور'
            });
        }
    };
};
exports.checkRole = checkRole;
