// backend/src/services/aiService.ts
// AI Service for Google Gemini API Integration
// Path: backend/src/services/aiService.ts

import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { prisma } from '../config/db_config';
import { logger, LoggerUtils } from '../utils/logger';
import { ApiError } from '../utils/apiError';

// Types and interfaces
interface GeminiConfig {
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
}

interface GeminiContent {
    role: 'user' | 'model';
    parts: Array<{
        text?: string;
        inlineData?: {
            mimeType: string;
            data: string;
        };
    }>;
}

interface GeminiRequest {
    contents: GeminiContent[];
    generationConfig?: GeminiConfig;
    safetySettings?: Array<{
        category: string;
        threshold: string;
    }>;
}

interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{
                text: string;
            }>;
            role: string;
        };
        finishReason: string;
        index: number;
        safetyRatings: Array<{
            category: string;
            probability: string;
        }>;
    }>;
    promptFeedback?: {
        safetyRatings: Array<{
            category: string;
            probability: string;
        }>;
    };
    usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
    };
}

interface ProcessingResult {
    response: string;
    tokensUsed: number;
    cost: number;
    model: string;
    finishReason: string;
}

interface FileAnalysisResult {
    extractedText?: string;
    analysis: string;
    confidence?: number;
    detectedObjects?: string[];
    metadata?: any;
}

// تعریف نوع جدید برای InternalAxiosRequestConfig
interface ExtendedRequestConfig extends InternalAxiosRequestConfig {
    metadata?: {
        startTime: number;
        [key: string]: any;
    };
}

// AI Service class
export class AIService {
    private client: AxiosInstance;
    private baseUrl: string;
    private defaultModel: string;

    constructor() {
        this.baseUrl = process.env.GOOGLE_AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
        this.defaultModel = process.env.DEFAULT_MODEL || 'gemini-pro';
        
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 60000, // 60 seconds
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Request interceptor
        this.client.interceptors.request.use(
            (config: ExtendedRequestConfig) => {
                const startTime = Date.now();
                config.metadata = { startTime };
                
                logger.debug('AI API Request:', {
                    url: config.url,
                    method: config.method,
                    data: config.data ? JSON.stringify(config.data).substring(0, 200) + '...' : null
                });
                
                return config;
            },
            (error) => {
                logger.error('AI API Request Error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.client.interceptors.response.use(
            (response) => {
                const endTime = Date.now();
                const requestConfig = response.config as ExtendedRequestConfig;
                const startTime = requestConfig.metadata?.startTime || endTime;
                const duration = endTime - startTime;

                LoggerUtils.logPerformance('ai_api_request', duration, {
                    url: response.config.url,
                    status: response.status
                });

                return response;
            },
            (error) => {
                const endTime = Date.now();
                const requestConfig = error.config as ExtendedRequestConfig;
                const startTime = requestConfig?.metadata?.startTime || endTime;
                const duration = endTime - startTime;

                logger.error('AI API Response Error:', {
                    url: error.config?.url,
                    status: error.response?.status,
                    data: error.response?.data,
                    duration: `${duration}ms`
                });

                return Promise.reject(error);
            }
        );
    }

    // Get user's API key
    private async getUserApiKey(userId: number): Promise<string> {
        const apiKey = await prisma.apiKey.findFirst({
            where: {
                userId,
                isActive: true,
                provider: 'google'
            }
        });

        if (!apiKey) {
            throw new ApiError('No active Google API key found', 400);
        }

        return apiKey.apiKey;
    }

    // Calculate cost (approximate)
    private calculateCost(tokensUsed: number, model: string): number {
        const pricing: { [key: string]: number } = {
            'gemini-pro': 0.000025, // $0.000025 per token
            'gemini-pro-vision': 0.00005, // $0.00005 per token
            'gemini-ultra': 0.0001 // $0.0001 per token
        };

        const rate = pricing[model] || pricing['gemini-pro'];
        return tokensUsed * rate;
    }

    // Update API key usage
    private async updateApiKeyUsage(userId: number, tokensUsed: number, cost: number): Promise<void> {
        await prisma.apiKey.updateMany({
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
        await prisma.usageStats.create({
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
    }

    // Chat completion
    async generateChatResponse(
        userId: number,
        messages: GeminiContent[],
        config?: Partial<GeminiConfig>,
        model: string = this.defaultModel
    ): Promise<ProcessingResult> {
        try {
            const apiKey = await this.getUserApiKey(userId);
            
            const request: GeminiRequest = {
                contents: messages,
                generationConfig: {
                    temperature: config?.temperature || 0.7,
                    topK: config?.topK || 40,
                    topP: config?.topP || 0.9,
                    maxOutputTokens: config?.maxOutputTokens || 1000,
                    ...config
                },
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

            const response = await this.client.post<GeminiResponse>(
                `/models/${model}:generateContent?key=${apiKey}`,
                request
            );

            if (!response.data.candidates || response.data.candidates.length === 0) {
                throw new ApiError('No response generated from AI model', 500);
            }

            const candidate = response.data.candidates[0];
            const responseText = candidate.content.parts[0]?.text || '';
            const tokensUsed = response.data.usageMetadata?.totalTokenCount || 0;
            const cost = this.calculateCost(tokensUsed, model);

            // Update usage statistics
            await this.updateApiKeyUsage(userId, tokensUsed, cost);

            // Log AI usage
            LoggerUtils.logAIUsage(userId, model, tokensUsed, cost);

            return {
                response: responseText,
                tokensUsed,
                cost,
                model,
                finishReason: candidate.finishReason
            };

        } catch (error) {
            if (axios.isAxiosError(error)) {
                const statusCode = error.response?.status || 500;
                const message = error.response?.data?.error?.message || 'AI service error';
                throw new ApiError(message, statusCode);
            }
            throw error;
        }
    }

    // Image analysis
    async analyzeImage(
        userId: number,
        imageData: string,
        mimeType: string,
        prompt?: string,
        config?: Partial<GeminiConfig>
    ): Promise<FileAnalysisResult> {
        try {
            const contents: GeminiContent[] = [
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

            const result = await this.generateChatResponse(
                userId,
                contents,
                config,
                'gemini-pro-vision'
            );

            return {
                analysis: result.response,
                confidence: 0.85, // Default confidence
                metadata: {
                    model: result.model,
                    tokensUsed: result.tokensUsed,
                    cost: result.cost
                }
            };

        } catch (error) {
            logger.error('Image analysis failed:', error);
            throw error;
        }
    }

    // OCR - Extract text from image
    async extractTextFromImage(
        userId: number,
        imageData: string,
        mimeType: string,
        language: string = 'fa'
    ): Promise<FileAnalysisResult> {
        try {
            const prompt = language === 'fa' 
                ? 'متن موجود در این تصویر را به دقت استخراج کن و بازنویسی کن. فقط متن را برگردان بدون توضیح اضافی.'
                : 'Extract and transcribe all text visible in this image. Return only the text without additional explanation.';

            const contents: GeminiContent[] = [
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

            const result = await this.generateChatResponse(
                userId,
                contents,
                { temperature: 0.1 }, // Lower temperature for more accurate text extraction
                'gemini-pro-vision'
            );

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

        } catch (error) {
            logger.error('OCR failed:', error);
            throw error;
        }
    }

    // Audio transcription (using external service or Gemini if supported)
    async transcribeAudio(
        userId: number,
        audioData: string,
        mimeType: string,
        language: string = 'fa'
    ): Promise<FileAnalysisResult> {
        try {
            // Note: Gemini doesn't support audio directly yet
            // This is a placeholder for future implementation
            // You might want to use Google Speech-to-Text API or similar
            
            throw new ApiError('Audio transcription not implemented yet', 501);

        } catch (error) {
            logger.error('Audio transcription failed:', error);
            throw error;
        }
    }

    // Generate content based on template
    async generateFromTemplate(
        userId: number,
        templateId: number,
        variables: { [key: string]: string },
        config?: Partial<GeminiConfig>
    ): Promise<ProcessingResult> {
        try {
            const template = await prisma.template.findUnique({
                where: { id: templateId }
            });

            if (!template) {
                throw new ApiError('Template not found', 404);
            }

            // Replace variables in template
            let prompt = template.promptTemplate;
            Object.entries(variables).forEach(([key, value]) => {
                prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
            });

            const contents: GeminiContent[] = [
                {
                    role: 'user',
                    parts: [{ text: prompt }]
                }
            ];

            // Merge template settings with provided config
            const templateConfig = template.modelSettings ? 
                JSON.parse(template.modelSettings as string) : {};
            const finalConfig = { ...templateConfig, ...config };

            const result = await this.generateChatResponse(
                userId,
                contents,
                finalConfig
            );

            // Update template usage count
            await prisma.template.update({
                where: { id: templateId },
                data: {
                    usageCount: {
                        increment: 1
                    }
                }
            });

            return result;

        } catch (error) {
            logger.error('Template generation failed:', error);
            throw error;
        }
    }

    // Get available models
    async getAvailableModels(userId: number): Promise<any[]> {
        try {
            const apiKey = await this.getUserApiKey(userId);
            
            const response = await this.client.get(`/models?key=${apiKey}`);
            return response.data.models || [];

        } catch (error) {
            logger.error('Failed to get available models:', error);
            throw error;
        }
    }

    // Health check
    async healthCheck(): Promise<boolean> {
        try {
            // Use a fallback API key for health check
            const apiKey = process.env.GOOGLE_AI_API_KEY;
            if (!apiKey) return false;

            const response = await this.client.get(`/models?key=${apiKey}`);
            return response.status === 200;

        } catch (error) {
            logger.error('AI service health check failed:', error);
            return false;
        }
    }
}

// Export singleton instance
export const aiService = new AIService();