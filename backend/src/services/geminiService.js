"use strict";
// backend/src/services/geminiService.ts
// سرویس ارتباط با Google AI API
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
exports.geminiService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
// Google AI API URLs
const API_URL = 'https://generativelanguage.googleapis.com/v1beta';
const API_KEY = process.env.GEMINI_API_KEY || '';
/**
 * سرویس ارتباط با Google AI API
 */
exports.geminiService = {
    /**
     * تولید پاسخ چت با استفاده از Gemini API
     */
    generateChatResponse: (messages_1, ...args_1) => __awaiter(void 0, [messages_1, ...args_1], void 0, function* (messages, modelName = 'gemini-pro', config = {}) {
        var _a, _b, _c;
        try {
            // تبدیل پیام‌ها به فرمت مورد نیاز API
            const formattedMessages = messages.map(msg => ({
                role: msg.role.toLowerCase(),
                parts: [{ text: msg.content }]
            }));
            // آماده‌سازی پارامترهای درخواست
            const requestParams = {
                contents: formattedMessages,
                generationConfig: {
                    temperature: config.temperature || 0.7,
                    maxOutputTokens: config.maxTokens || 1000,
                    topP: config.topP || 0.9,
                    topK: config.topK || 40
                }
            };
            // ارسال درخواست به API
            const response = yield axios_1.default.post(`${API_URL}/models/${modelName}:generateContent?key=${API_KEY}`, requestParams);
            // استخراج پاسخ
            const generatedText = ((_c = (_b = (_a = response.data.candidates[0]) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.parts[0]) === null || _c === void 0 ? void 0 : _c.text) || '';
            // شبیه‌سازی اطلاعات توکن (در API واقعی Gemini به صورت دقیق ارائه می‌شود)
            const promptTokens = estimateTokenCount(messages.map(m => m.content).join(' '));
            const completionTokens = estimateTokenCount(generatedText);
            return {
                text: generatedText,
                usage: {
                    promptTokens,
                    completionTokens,
                    totalTokens: promptTokens + completionTokens
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Error in generateChatResponse:', error);
            throw new Error('خطا در ارتباط با Gemini API');
        }
    }),
    /**
     * تحلیل تصویر با استفاده از Gemini Vision API
     */
    analyzeImage: (imageUrl_1, prompt_1, ...args_1) => __awaiter(void 0, [imageUrl_1, prompt_1, ...args_1], void 0, function* (imageUrl, prompt, modelName = 'gemini-pro-vision') {
        var _a, _b, _c;
        try {
            // بررسی اینکه آیا URL باید تبدیل به base64 شود یا نه
            let imageData;
            if (imageUrl.startsWith('data:image')) {
                // داده تصویر به صورت base64 ارسال شده است
                imageData = imageUrl;
            }
            else {
                // دریافت تصویر از URL
                const imageResponse = yield axios_1.default.get(imageUrl, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(imageResponse.data, 'binary');
                imageData = `data:${imageResponse.headers['content-type']};base64,${buffer.toString('base64')}`;
            }
            // آماده‌سازی پارامترهای درخواست
            const requestParams = {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt || 'توضیح جزئیات این تصویر را بده'
                            },
                            {
                                inlineData: {
                                    mimeType: imageData.split(';')[0].split(':')[1],
                                    data: imageData.split(',')[1]
                                }
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 1024
                }
            };
            // ارسال درخواست به API
            const response = yield axios_1.default.post(`${API_URL}/models/${modelName}:generateContent?key=${API_KEY}`, requestParams);
            // استخراج پاسخ
            const analysisText = ((_c = (_b = (_a = response.data.candidates[0]) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.parts[0]) === null || _c === void 0 ? void 0 : _c.text) || '';
            // شبیه‌سازی اطلاعات توکن
            const promptTokens = 500; // تصاویر معمولاً حدود 500 توکن مصرف می‌کنند
            const completionTokens = estimateTokenCount(analysisText);
            return {
                text: analysisText,
                usage: {
                    promptTokens,
                    completionTokens,
                    totalTokens: promptTokens + completionTokens
                }
            };
        }
        catch (error) {
            logger_1.logger.error('Error in analyzeImage:', error);
            throw new Error('خطا در تحلیل تصویر با Gemini Vision API');
        }
    })
};
/**
 * تخمین تعداد توکن‌های یک متن
 * این یک تخمین ساده است و در یک محیط واقعی باید از کتابخانه‌های دقیق‌تر استفاده شود
 */
function estimateTokenCount(text) {
    // تخمین میانگین: هر 4 کاراکتر تقریباً 1 توکن است
    return Math.ceil(text.length / 4);
}
exports.default = exports.geminiService;
