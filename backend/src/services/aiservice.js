"use strict";
// backend/src/services/aiService.ts
// AI Service for Google Gemini API Integration
// Path: backend/src/services/aiService.ts
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
exports.aiService = exports.AIService = void 0;
const axios_1 = __importDefault(require("axios"));
const db_config_1 = require("../config/db_config");
const logger_1 = require("../utils/logger");
const apiError_1 = require("../utils/apiError");
// AI Service class
class AIService {
    constructor() {
        this.baseUrl = process.env.GOOGLE_AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
        this.defaultModel = process.env.DEFAULT_MODEL || 'gemini-pro';
        this.client = axios_1.default.create({
            baseURL: this.baseUrl,
            timeout: 60000, // 60 seconds
            headers: {
                'Content-Type': 'application/json'
            }
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use((config) => {
            const startTime = Date.now();
            config.metadata = { startTime };
            logger_1.logger.debug('AI API Request:', {
                url: config.url,
                method: config.method,
                data: config.data ? JSON.stringify(config.data).substring(0, 200) + '...' : null
            });
            return config;
        }, (error) => {
            logger_1.logger.error('AI API Request Error:', error);
            return Promise.reject(error);
        });
        // Response interceptor
        this.client.interceptors.response.use((response) => {
            var _a;
            const endTime = Date.now();
            const requestConfig = response.config;
            const startTime = ((_a = requestConfig.metadata) === null || _a === void 0 ? void 0 : _a.startTime) || endTime;
            const duration = endTime - startTime;
            logger_1.LoggerUtils.logPerformance('ai_api_request', duration, {
                url: response.config.url,
                status: response.status
            });
            return response;
        }, (error) => {
            var _a, _b, _c, _d;
            const endTime = Date.now();
            const requestConfig = error.config;
            const startTime = ((_a = requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.metadata) === null || _a === void 0 ? void 0 : _a.startTime) || endTime;
            const duration = endTime - startTime;
            logger_1.logger.error('AI API Response Error:', {
                url: (_b = error.config) === null || _b === void 0 ? void 0 : _b.url,
                status: (_c = error.response) === null || _c === void 0 ? void 0 : _c.status,
                data: (_d = error.response) === null || _d === void 0 ? void 0 : _d.data,
                duration: `${duration}ms`
            });
            return Promise.reject(error);
        });
    }
    // Get user's API key
    getUserApiKey(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiKey = yield db_config_1.prisma.apiKey.findFirst({
                where: {
                    userId,
                    isActive: true,
                    provider: 'google'
                }
            });
            if (!apiKey) {
                throw new apiError_1.ApiError('No active Google API key found', 400);
            }
            return apiKey.apiKey;
        });
    }
    // Calculate cost (approximate)
    calculateCost(tokensUsed, model) {
        const pricing = {
            'gemini-pro': 0.000025, // $0.000025 per token
            'gemini-pro-vision': 0.00005, // $0.00005 per token
            'gemini-ultra': 0.0001 // $0.0001 per token
        };
        const rate = pricing[model] || pricing['gemini-pro'];
        return tokensUsed * rate;
    }
    // Update API key usage
    updateApiKeyUsage(userId, tokensUsed, cost) {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_config_1.prisma.apiKey.updateMany({
                where: {
                    userId,
                    isActive: true,
                    provider: 'google'
                },
                data: {
                    usageCount: {
                        increment: 1
                    }
                }
            });
            // Log usage statistics
            yield db_config_1.prisma.usageStats.create({
                data: {
                    userId,
                    operationType: 'chat',
                    modelUsed: this.defaultModel,
                    tokensInput: Math.floor(tokensUsed * 0.7), // Approximate
                    tokensOutput: Math.floor(tokensUsed * 0.3), // Approximate
                    cost,
                    status: 'success',
                    date: new Date(),
                    hour: new Date().getHours()
                }
            });
        });
    }
    // Chat completion
    generateChatResponse(userId_1, messages_1, config_1) {
        return __awaiter(this, arguments, void 0, function* (userId, messages, config, model = this.defaultModel) {
            var _a, _b, _c, _d, _e, _f;
            try {
                const apiKey = yield this.getUserApiKey(userId);
                const request = {
                    contents: messages,
                    generationConfig: Object.assign({ temperature: (config === null || config === void 0 ? void 0 : config.temperature) || 0.7, topK: (config === null || config === void 0 ? void 0 : config.topK) || 40, topP: (config === null || config === void 0 ? void 0 : config.topP) || 0.9, maxOutputTokens: (config === null || config === void 0 ? void 0 : config.maxOutputTokens) || 1000 }, config),
                    safetySettings: [
                        {
                            category: 'HARM_CATEGORY_HARASSMENT',
                            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                        },
                        {
                            category: 'HARM_CATEGORY_HATE_SPEECH',
                            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                        },
                        {
                            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                        },
                        {
                            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                        }
                    ]
                };
                const response = yield this.client.post(`/models/${model}:generateContent?key=${apiKey}`, request);
                if (!response.data.candidates || response.data.candidates.length === 0) {
                    throw new apiError_1.ApiError('No response generated from AI model', 500);
                }
                const candidate = response.data.candidates[0];
                const responseText = ((_a = candidate.content.parts[0]) === null || _a === void 0 ? void 0 : _a.text) || '';
                const tokensUsed = ((_b = response.data.usageMetadata) === null || _b === void 0 ? void 0 : _b.totalTokenCount) || 0;
                const cost = this.calculateCost(tokensUsed, model);
                // Update usage statistics
                yield this.updateApiKeyUsage(userId, tokensUsed, cost);
                // Log AI usage
                logger_1.LoggerUtils.logAIUsage(userId, model, tokensUsed, cost);
                return {
                    response: responseText,
                    tokensUsed,
                    cost,
                    model,
                    finishReason: candidate.finishReason
                };
            }
            catch (error) {
                if (axios_1.default.isAxiosError(error)) {
                    const statusCode = ((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) || 500;
                    const message = ((_f = (_e = (_d = error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.error) === null || _f === void 0 ? void 0 : _f.message) || 'AI service error';
                    throw new apiError_1.ApiError(message, statusCode);
                }
                throw error;
            }
        });
    }
    // Image analysis
    analyzeImage(userId, imageData, mimeType, prompt, config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contents = [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: prompt || 'تصویر را تحلیل کن و توضیح کاملی از آن ارائه بده.'
                            },
                            {
                                inlineData: {
                                    mimeType,
                                    data: imageData
                                }
                            }
                        ]
                    }
                ];
                const result = yield this.generateChatResponse(userId, contents, config, 'gemini-pro-vision');
                return {
                    analysis: result.response,
                    confidence: 0.85, // Default confidence
                    metadata: {
                        model: result.model,
                        tokensUsed: result.tokensUsed,
                        cost: result.cost
                    }
                };
            }
            catch (error) {
                logger_1.logger.error('Image analysis failed:', error);
                throw error;
            }
        });
    }
    // OCR - Extract text from image
    extractTextFromImage(userId_1, imageData_1, mimeType_1) {
        return __awaiter(this, arguments, void 0, function* (userId, imageData, mimeType, language = 'fa') {
            try {
                const prompt = language === 'fa'
                    ? 'متن موجود در این تصویر را به دقت استخراج کن و بازنویسی کن. فقط متن را برگردان بدون توضیح اضافی.'
                    : 'Extract and transcribe all text visible in this image. Return only the text without additional explanation.';
                const contents = [
                    {
                        role: 'user',
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType,
                                    data: imageData
                                }
                            }
                        ]
                    }
                ];
                const result = yield this.generateChatResponse(userId, contents, { temperature: 0.1 }, // Lower temperature for more accurate text extraction
                'gemini-pro-vision');
                return {
                    extractedText: result.response,
                    analysis: 'Text extraction completed',
                    confidence: 0.9,
                    metadata: {
                        language,
                        model: result.model,
                        tokensUsed: result.tokensUsed,
                        cost: result.cost
                    }
                };
            }
            catch (error) {
                logger_1.logger.error('OCR failed:', error);
                throw error;
            }
        });
    }
    // Audio transcription (using external service or Gemini if supported)
    transcribeAudio(userId_1, audioData_1, mimeType_1) {
        return __awaiter(this, arguments, void 0, function* (userId, audioData, mimeType, language = 'fa') {
            try {
                // Note: Gemini doesn't support audio directly yet
                // This is a placeholder for future implementation
                // You might want to use Google Speech-to-Text API or similar
                throw new apiError_1.ApiError('Audio transcription not implemented yet', 501);
            }
            catch (error) {
                logger_1.logger.error('Audio transcription failed:', error);
                throw error;
            }
        });
    }
    // Generate content based on template
    generateFromTemplate(userId, templateId, variables, config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const template = yield db_config_1.prisma.template.findUnique({
                    where: { id: templateId }
                });
                if (!template) {
                    throw new apiError_1.ApiError('Template not found', 404);
                }
                // Replace variables in template
                let prompt = template.promptTemplate;
                Object.entries(variables).forEach(([key, value]) => {
                    prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
                });
                const contents = [
                    {
                        role: 'user',
                        parts: [{ text: prompt }]
                    }
                ];
                // Merge template settings with provided config
                const templateConfig = template.modelSettings ?
                    JSON.parse(template.modelSettings) : {};
                const finalConfig = Object.assign(Object.assign({}, templateConfig), config);
                const result = yield this.generateChatResponse(userId, contents, finalConfig);
                // Update template usage count
                yield db_config_1.prisma.template.update({
                    where: { id: templateId },
                    data: {
                        usageCount: {
                            increment: 1
                        }
                    }
                });
                return result;
            }
            catch (error) {
                logger_1.logger.error('Template generation failed:', error);
                throw error;
            }
        });
    }
    // Get available models
    getAvailableModels(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const apiKey = yield this.getUserApiKey(userId);
                const response = yield this.client.get(`/models?key=${apiKey}`);
                return response.data.models || [];
            }
            catch (error) {
                logger_1.logger.error('Failed to get available models:', error);
                throw error;
            }
        });
    }
    // Health check
    healthCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Use a fallback API key for health check
                const apiKey = process.env.GOOGLE_AI_API_KEY;
                if (!apiKey)
                    return false;
                const response = yield this.client.get(`/models?key=${apiKey}`);
                return response.status === 200;
            }
            catch (error) {
                logger_1.logger.error('AI service health check failed:', error);
                return false;
            }
        });
    }
}
exports.AIService = AIService;
// Export singleton instance
exports.aiService = new AIService();
