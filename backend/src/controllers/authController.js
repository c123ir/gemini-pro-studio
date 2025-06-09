"use strict";
// backend/src/controllers/authController.ts
// کنترلر احراز هویت - Backend TypeScript
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
// Generate JWT Token
const generateToken = (userId) => {
    try {
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const options = {
            expiresIn: (process.env.JWT_EXPIRES_IN || '7d')
        };
        return jsonwebtoken_1.default.sign({ userId }, secret, options);
    }
    catch (error) {
        logger_1.logger.error('Token generation error:', error);
        throw new Error('مشکل در ایجاد توکن');
    }
};
// Register new user
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Validation
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: 'تمام فیلدها الزامی هستند'
            });
            return;
        }
        if (password.length < 8) {
            res.status(400).json({
                success: false,
                message: 'رمز عبور باید حداقل ۸ کاراکتر باشد'
            });
            return;
        }
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                message: 'فرمت ایمیل صحیح نیست'
            });
            return;
        }
        // Check if user already exists
        const existingUser = yield prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'کاربری با این ایمیل قبلاً ثبت‌نام کرده است'
            });
            return;
        }
        // Hash password
        const saltRounds = 12;
        const hashedPassword = yield bcryptjs_1.default.hash(password, saltRounds);
        // Create user
        const user = yield prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                role: 'user',
                isActive: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        // Generate token
        const token = generateToken(user.id);
        logger_1.logger.info(`New user registered: ${user.email}`);
        res.status(201).json({
            success: true,
            message: 'ثبت‌نام با موفقیت انجام شد',
            data: {
                user,
                token
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در سرور. لطفاً مجدداً تلاش کنید'
        });
    }
});
exports.register = register;
// Login user
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'ایمیل و رمز عبور الزامی است'
            });
            return;
        }
        // Find user
        const user = yield prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'ایمیل یا رمز عبور اشتباه است'
            });
            return;
        }
        // Check if user is active
        if (!user.isActive) {
            res.status(403).json({
                success: false,
                message: 'حساب کاربری شما غیرفعال است. با پشتیبانی تماس بگیرید'
            });
            return;
        }
        // Verify password
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'ایمیل یا رمز عبور اشتباه است'
            });
            return;
        }
        // Generate token
        const token = generateToken(user.id);
        // Remove password from response
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        logger_1.logger.info(`User logged in: ${user.email}`);
        res.json({
            success: true,
            message: 'ورود با موفقیت انجام شد',
            data: {
                user: userWithoutPassword,
                token
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در سرور. لطفاً مجدداً تلاش کنید'
        });
    }
});
exports.login = login;
// Get current user profile
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'احراز هویت مطلوب است'
            });
            return;
        }
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'کاربر یافت نشد'
            });
            return;
        }
        res.json({
            success: true,
            data: { user }
        });
    }
    catch (error) {
        logger_1.logger.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در سرور'
        });
    }
});
exports.getProfile = getProfile;
// Update user profile
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { name } = req.body;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'احراز هویت مطلوب است'
            });
            return;
        }
        if (!name || name.trim().length < 2) {
            res.status(400).json({
                success: false,
                message: 'نام باید حداقل ۲ کاراکتر باشد'
            });
            return;
        }
        const updatedUser = yield prisma.user.update({
            where: { id: userId },
            data: { name: name.trim() },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
        logger_1.logger.info(`User profile updated: ${updatedUser.email}`);
        res.json({
            success: true,
            message: 'پروفایل با موفقیت بروزرسانی شد',
            data: { user: updatedUser }
        });
    }
    catch (error) {
        logger_1.logger.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در بروزرسانی پروفایل'
        });
    }
});
exports.updateProfile = updateProfile;
// Change password
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { currentPassword, newPassword } = req.body;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'احراز هویت مطلوب است'
            });
            return;
        }
        if (!currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'رمز عبور فعلی و جدید الزامی است'
            });
            return;
        }
        if (newPassword.length < 8) {
            res.status(400).json({
                success: false,
                message: 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد'
            });
            return;
        }
        // Get user with current password
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, password: true }
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'کاربر یافت نشد'
            });
            return;
        }
        // Verify current password
        const isCurrentPasswordValid = yield bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            res.status(400).json({
                success: false,
                message: 'رمز عبور فعلی اشتباه است'
            });
            return;
        }
        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = yield bcryptjs_1.default.hash(newPassword, saltRounds);
        // Update password
        yield prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });
        logger_1.logger.info(`Password changed for user: ${user.email}`);
        res.json({
            success: true,
            message: 'رمز عبور با موفقیت تغییر کرد'
        });
    }
    catch (error) {
        logger_1.logger.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در تغییر رمز عبور'
        });
    }
});
exports.changePassword = changePassword;
// Logout (client-side token removal, optional server-side token blacklisting)
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // In a more sophisticated setup, you might want to blacklist the token
        // For now, we'll just send a success response
        // The client should remove the token from storage
        res.json({
            success: true,
            message: 'خروج با موفقیت انجام شد'
        });
    }
    catch (error) {
        logger_1.logger.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در خروج از سیستم'
        });
    }
});
exports.logout = logout;
