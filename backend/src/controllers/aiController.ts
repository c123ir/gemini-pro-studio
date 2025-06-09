// backend/src/controllers/aiController.ts
// کنترلر مربوط به سرویس‌های هوش مصنوعی

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { geminiService } from '../services/geminiService';
import { handleError } from '../utils/errorHandler';

const prisma = new PrismaClient();

/**
 * ارسال پیام به چت و دریافت پاسخ
 */
export const chatWithGemini = async (req: Request, res: Response) => {
  try {
    const { messages, config = {}, modelName = 'gemini-pro' } = req.body;
    const userId = req.user?.id;

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'پیام‌ها الزامی هستند و باید آرایه باشند'
      });
    }

    // Process with Gemini API
    const startTime = Date.now();
    const response = await geminiService.generateChatResponse(messages, modelName, config);
    const processingTime = Date.now() - startTime;

    // Log usage
    if (userId) {
      await logApiUsage(userId, 'CHAT', modelName, {
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        processingTime
      });
    }

    return res.json({
      success: true,
      data: {
        response: response.text,
        modelName,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Error in chatWithGemini:', error);
    return handleError(res, error);
  }
};

/**
 * ادامه یک مکالمه
 */
export const continueConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { content, config = {}, modelName = 'gemini-pro' } = req.body;
    const userId = req.user?.id;

    // Validate input
    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'محتوای پیام الزامی است'
      });
    }

    // Get conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: Number(conversationId), userId },
      include: { 
        messages: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'asc' },
          take: 50 // Limit to most recent messages
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'مکالمه یافت نشد'
      });
    }

    // Format messages for Gemini
    const formattedMessages = conversation.messages.map((msg: any) => ({
      role: msg.role.toLowerCase(),
      content: msg.content
    }));

    // Add user's new message
    formattedMessages.push({ role: 'user', content });

    // Get response from Gemini
    const startTime = Date.now();
    const response = await geminiService.generateChatResponse(formattedMessages, modelName, config);
    const processingTime = Date.now() - startTime;

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId: Number(conversationId),
        role: 'USER',
        content,
        tokenCount: response.usage.promptTokens,
        modelUsed: modelName
      }
    });

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: Number(conversationId),
        role: 'ASSISTANT',
        content: response.text,
        tokenCount: response.usage.completionTokens,
        modelUsed: modelName,
        responseTimeMs: processingTime,
        parentMessageId: userMessage.id
      }
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: Number(conversationId) },
      data: {
        messageCount: { increment: 2 },
        totalTokens: { increment: response.usage.totalTokens },
        lastMessageAt: new Date()
      }
    });

    // Log usage
    if (userId) {
      await logApiUsage(userId, 'CHAT', modelName, {
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        processingTime
      });
    }

    return res.json({
      success: true,
      data: {
        response: response.text,
        modelName,
        messageId: assistantMessage.id,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Error in continueConversation:', error);
    return handleError(res, error);
  }
};

/**
 * ایجاد مکالمه جدید
 */
export const createConversation = async (req: Request, res: Response) => {
  try {
    const { title, initialMessage, modelName = 'gemini-pro', config = {} } = req.body;
    const userId = req.user?.id;

    // Validate input
    if (!title || !initialMessage) {
      return res.status(400).json({
        success: false,
        message: 'عنوان و پیام اولیه الزامی هستند'
      });
    }

    // Get response from Gemini
    const startTime = Date.now();
    const response = await geminiService.generateChatResponse([
      { role: 'user', content: initialMessage }
    ], modelName, config);
    const processingTime = Date.now() - startTime;

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title,
        modelName,
        messageCount: 2,
        totalTokens: response.usage.totalTokens,
        lastMessageAt: new Date()
      }
    });

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: initialMessage,
        tokenCount: response.usage.promptTokens,
        modelUsed: modelName
      }
    });

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: response.text,
        tokenCount: response.usage.completionTokens,
        modelUsed: modelName,
        responseTimeMs: processingTime,
        parentMessageId: userMessage.id
      }
    });

    // Log usage
    if (userId) {
      await logApiUsage(userId, 'CHAT', modelName, {
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        processingTime
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        conversation: {
          id: conversation.id,
          title: conversation.title
        },
        message: {
          response: response.text,
          modelName,
          messageId: assistantMessage.id,
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
          totalTokens: response.usage.totalTokens,
          processingTime
        }
      }
    });

  } catch (error) {
    logger.error('Error in createConversation:', error);
    return handleError(res, error);
  }
};

/**
 * تحلیل یک تصویر
 */
export const analyzeImage = async (req: Request, res: Response) => {
  try {
    const { imageUrl, prompt, modelName = 'gemini-pro-vision' } = req.body;
    const userId = req.user?.id;

    // Validate input
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'آدرس تصویر الزامی است'
      });
    }

    // Process with Gemini Vision API
    const startTime = Date.now();
    const response = await geminiService.analyzeImage(imageUrl, prompt, modelName);
    const processingTime = Date.now() - startTime;

    // Log usage
    if (userId) {
      await logApiUsage(userId, 'IMAGE_ANALYSIS', modelName, {
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        processingTime
      });
    }

    return res.json({
      success: true,
      data: {
        analysis: response.text,
        modelName,
        processingTime
      }
    });

  } catch (error) {
    logger.error('Error in analyzeImage:', error);
    return handleError(res, error);
  }
};

/**
 * ثبت استفاده از API
 */
const logApiUsage = async (
  userId: number,
  operationType: 'CHAT' | 'IMAGE_ANALYSIS' | 'IMAGE_GENERATION' | 'TEXT_TO_SPEECH' | 'SPEECH_TO_TEXT',
  modelName: string,
  stats: {
    promptTokens?: number;
    completionTokens?: number;
    processingTime: number;
  }
) => {
  try {
    // ثبت آمار استفاده
    await prisma.usageStats.create({
      data: {
        userId,
        operationType,
        modelName,
        promptTokens: stats.promptTokens || 0,
        completionTokens: stats.completionTokens || 0,
        totalTokens: (stats.promptTokens || 0) + (stats.completionTokens || 0),
        processingTimeMs: stats.processingTime,
        status: 'SUCCESS',
        cost: calculateCost(modelName, (stats.promptTokens || 0) + (stats.completionTokens || 0))
      }
    });
    
    // به روزرسانی آمار کاربر
    await prisma.user.update({
      where: { id: userId },
      data: {
        apiUsageCount: {
          increment: 1
        }
      }
    });
    
  } catch (error) {
    logger.error('Error logging API usage:', error);
    // در صورت خطا در لاگ، عملیات اصلی باید ادامه پیدا کند
    // بنابراین فقط ثبت خطا می‌کنیم و exception پرتاب نمی‌کنیم
  }
};

/**
 * محاسبه هزینه بر اساس تعداد توکن و مدل
 */
const calculateCost = (model: string, totalTokens: number): number => {
  let costPerMillionTokens = 0;
  
  switch (model) {
    case 'gemini-pro':
      costPerMillionTokens = 0.0025; // $0.0025 per 1000 tokens
      break;
    case 'gemini-pro-vision':
      costPerMillionTokens = 0.0050; // $0.0050 per 1000 tokens
      break;
    default:
      costPerMillionTokens = 0.0025;
  }
  
  // Cost per token
  const costPerToken = costPerMillionTokens / 1000;
  
  // Calculate total cost
  return totalTokens * costPerToken;
}; 