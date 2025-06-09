// backend/src/controllers/authController.ts
// کنترلر احراز هویت - Backend TypeScript

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

// Generate JWT Token
const generateToken = (userId: string): string => {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const options: SignOptions = { 
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn']
    };
    return jwt.sign({ userId }, secret, options);
  } catch (error) {
    logger.error('Token generation error:', error);
    throw new Error('مشکل در ایجاد توکن');
  }
};

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password }: RegisterRequest = req.body;

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
    const existingUser = await prisma.user.findUnique({
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
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
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

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'ثبت‌نام با موفقیت انجام شد',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در سرور. لطفاً مجدداً تلاش کنید'
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'ایمیل و رمز عبور الزامی است'
      });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
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
    const isPasswordValid = await bcrypt.compare(password, user.password);
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
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      message: 'ورود با موفقیت انجام شد',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در سرور. لطفاً مجدداً تلاش کنید'
    });
  }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'احراز هویت مطلوب است'
      });
      return;
    }

    const user = await prisma.user.findUnique({
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

  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در سرور'
    });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
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

    const updatedUser = await prisma.user.update({
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

    logger.info(`User profile updated: ${updatedUser.email}`);

    res.json({
      success: true,
      message: 'پروفایل با موفقیت بروزرسانی شد',
      data: { user: updatedUser }
    });

  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در بروزرسانی پروفایل'
    });
  }
};

// Change password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
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
    const user = await prisma.user.findUnique({
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
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'رمز عبور فعلی اشتباه است'
      });
      return;
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    logger.info(`Password changed for user: ${user.email}`);

    res.json({
      success: true,
      message: 'رمز عبور با موفقیت تغییر کرد'
    });

  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در تغییر رمز عبور'
    });
  }
};

// Logout (client-side token removal, optional server-side token blacklisting)
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just send a success response
    // The client should remove the token from storage
    
    res.json({
      success: true,
      message: 'خروج با موفقیت انجام شد'
    });

  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در خروج از سیستم'
    });
  }
};