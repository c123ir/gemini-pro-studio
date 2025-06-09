"use strict";
// backend/src/controllers/aiController.ts
// کنترلر مربوط به سرویس‌های هوش مصنوعی
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeImage = exports.createConversation = exports.continueConversation = exports.chatWithGemini = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const geminiService_1 = require("../services/geminiService");
const errorHandler_1 = require("../utils/errorHandler");
const prisma = new client_1.PrismaClient();
/**
 * ارسال پیام به چت و دریافت پاسخ
 */
const chatWithGemini = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { messages, config = {}, modelName = 'gemini-pro' } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Validate input
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'پیام‌ها الزامی هستند و باید آرایه باشند'
            });
        }
        // Process with Gemini API
        const startTime = Date.now();
        const response = yield geminiService_1.geminiService.generateChatResponse(messages, modelName, config);
        const processingTime = Date.now() - startTime;
        // Log usage
        if (userId) {
            yield logApiUsage(userId, 'CHAT', modelName, {
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
    }
    catch (error) {
        logger_1.logger.error('Error in chatWithGemini:', error);
        return (0, errorHandler_1.handleError)(res, error);
    }
});
exports.chatWithGemini = chatWithGemini;
/**
 * ادامه یک مکالمه
 */
const continueConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { conversationId } = req.params;
        const { content, config = {}, modelName = 'gemini-pro' } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Validate input
        if (!content || typeof content !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'محتوای پیام الزامی است'
            });
        }
        // Get conversation
        const conversation = yield prisma.conversation.findUnique({
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
        const formattedMessages = conversation.messages.map((msg) => ({
            role: msg.role.toLowerCase(),
            content: msg.content
        }));
        // Add user's new message
        formattedMessages.push({ role: 'user', content });
        // Get response from Gemini
        const startTime = Date.now();
        const response = yield geminiService_1.geminiService.generateChatResponse(formattedMessages, modelName, config);
        const processingTime = Date.now() - startTime;
        // Save user message
        const userMessage = yield prisma.message.create({
            data: {
                conversationId: Number(conversationId),
                role: 'USER',
                content,
                tokenCount: response.usage.promptTokens,
                modelUsed: modelName
            }
        });
        // Save assistant message
        const assistantMessage = yield prisma.message.create({
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
        yield prisma.conversation.update({
            where: { id: Number(conversationId) },
            data: {
                messageCount: { increment: 2 },
                totalTokens: { increment: response.usage.totalTokens },
                lastMessageAt: new Date()
            }
        });
        // Log usage
        if (userId) {
            yield logApiUsage(userId, 'CHAT', modelName, {
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
    }
    catch (error) {
        logger_1.logger.error('Error in continueConversation:', error);
        return (0, errorHandler_1.handleError)(res, error);
    }
});
exports.continueConversation = continueConversation;
/**
 * ایجاد مکالمه جدید
 */
const createConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, initialMessage, modelName = 'gemini-pro', config = {} } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Validate input
        if (!title || !initialMessage) {
            return res.status(400).json({
                success: false,
                message: 'عنوان و پیام اولیه الزامی هستند'
            });
        }
        // Get response from Gemini
        const startTime = Date.now();
        const response = yield geminiService_1.geminiService.generateChatResponse([
            { role: 'user', content: initialMessage }
        ], modelName, config);
        const processingTime = Date.now() - startTime;
        // Create conversation
        const conversation = yield prisma.conversation.create({
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
        const userMessage = yield prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: 'USER',
                content: initialMessage,
                tokenCount: response.usage.promptTokens,
                modelUsed: modelName
            }
        });
        // Save assistant message
        const assistantMessage = yield prisma.message.create({
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
            yield logApiUsage(userId, 'CHAT', modelName, {
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
    }
    catch (error) {
        logger_1.logger.error('Error in createConversation:', error);
        return (0, errorHandler_1.handleError)(res, error);
    }
});
exports.createConversation = createConversation;
/**
 * تحلیل یک تصویر
 */
const analyzeImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { imageUrl, prompt, modelName = 'gemini-pro-vision' } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Validate input
        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'آدرس تصویر الزامی است'
            });
        }
        // Process with Gemini Vision API
        const startTime = Date.now();
        const response = yield geminiService_1.geminiService.analyzeImage(imageUrl, prompt, modelName);
        const processingTime = Date.now() - startTime;
        // Log usage
        if (userId) {
            yield logApiUsage(userId, 'IMAGE_ANALYSIS', modelName, {
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
    }
    catch (error) {
        logger_1.logger.error('Error in analyzeImage:', error);
        return (0, errorHandler_1.handleError)(res, error);
    }
});
exports.analyzeImage = analyzeImage;
/**
 * ثبت استفاده از API
 */
const logApiUsage = (userId, operationType, modelName, stats) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // ثبت آمار استفاده
        yield prisma.usageStats.create({
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
        yield prisma.user.update({
            where: { id: userId },
            data: {
                apiUsageCount: {
                    increment: 1
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error logging API usage:', error);
        // در صورت خطا در لاگ، عملیات اصلی باید ادامه پیدا کند
        // بنابراین فقط ثبت خطا می‌کنیم و exception پرتاب نمی‌کنیم
    }
});
/**
 * محاسبه هزینه بر اساس تعداد توکن و مدل
 */
const calculateCost = (model, totalTokens) => {
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
