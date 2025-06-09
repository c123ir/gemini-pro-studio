// frontend/src/services/geminiService.ts
// سرویس ارتباط با Gemini API

import axios, { AxiosResponse } from 'axios';
import { apiService } from './apiService';

interface GeminiConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

interface ChatRequest {
  messages: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  }[];
  config?: GeminiConfig;
  modelName?: string;
}

interface ChatResponse {
  response: string;
  modelName: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  processingTime: number;
}

interface GenerateImageRequest {
  prompt: string;
  negativePrompt?: string;
  size?: string;
  style?: string;
  modelName?: string;
}

interface GenerateImageResponse {
  imageUrl: string;
  modelName: string;
  processingTime: number;
}

interface AnalyzeImageRequest {
  imageUrl: string;
  prompt?: string;
  modelName?: string;
}

interface AnalyzeImageResponse {
  analysis: string;
  modelName: string;
  processingTime: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const API_BASE_URL = '/api/v1/ai';

/**
 * سرویس ارتباط با Gemini API
 */
export const geminiService = {
  /**
   * ارسال پیام به چت و دریافت پاسخ
   */
  sendChatMessage: async (chatRequest: ChatRequest): Promise<ChatResponse> => {
    try {
      const response = await apiService.post<ApiResponse<ChatResponse>>(`${API_BASE_URL}/chat`, chatRequest);
      return response.data;
    } catch (error) {
      console.error('Error in sendChatMessage:', error);
      throw error;
    }
  },

  /**
   * ارسال پیام ساده به Gemini API
   */
  sendMessage: async (
    message: string, 
    modelName: string = 'gemini-pro',
    config?: GeminiConfig
  ): Promise<ChatResponse> => {
    const chatRequest: ChatRequest = {
      messages: [{ role: 'user', content: message }],
      modelName,
      config
    };
    
    return geminiService.sendChatMessage(chatRequest);
  },

  /**
   * ادامه یک مکالمه با ارسال پیام جدید
   */
  continueConversation: async (
    conversationId: string,
    message: string,
    modelName: string = 'gemini-pro',
    config?: GeminiConfig
  ): Promise<ChatResponse> => {
    try {
      const response = await apiService.post<ApiResponse<ChatResponse>>(
        `${API_BASE_URL}/conversations/${conversationId}/messages`, 
        {
        content: message,
        modelName,
        config
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in continueConversation:', error);
      throw error;
    }
  },

  /**
   * ایجاد یک مکالمه جدید
   */
  createConversation: async (
    title: string,
    initialMessage: string,
    modelName: string = 'gemini-pro',
    config?: GeminiConfig
  ): Promise<{
    conversation: {
      id: string;
      title: string;
    };
    message: ChatResponse;
  }> => {
    try {
      const response = await apiService.post<ApiResponse<{
        conversation: {
          id: string;
          title: string;
        };
        message: ChatResponse;
      }>>(
        `${API_BASE_URL}/conversations`, 
        {
        title,
        initialMessage,
        modelName,
        config
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in createConversation:', error);
      throw error;
    }
  },

  /**
   * تولید تصویر با استفاده از متن
   */
  generateImage: async (request: GenerateImageRequest): Promise<GenerateImageResponse> => {
    try {
      const response = await apiService.post<ApiResponse<GenerateImageResponse>>(
        `${API_BASE_URL}/images/generate`, 
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error in generateImage:', error);
      throw error;
    }
  },

  /**
   * تحلیل یک تصویر
   */
  analyzeImage: async (request: AnalyzeImageRequest): Promise<AnalyzeImageResponse> => {
    try {
      const response = await apiService.post<ApiResponse<AnalyzeImageResponse>>(
        `${API_BASE_URL}/images/analyze`, 
        request
      );
      return response.data;
    } catch (error) {
      console.error('Error in analyzeImage:', error);
      throw error;
    }
  },

  /**
   * استخراج متن از تصویر (OCR)
   */
  extractTextFromImage: async (imageUrl: string): Promise<{ text: string }> => {
    try {
      const response = await apiService.post<ApiResponse<{ text: string }>>(
        `${API_BASE_URL}/images/ocr`, 
        { imageUrl }
      );
      return response.data;
    } catch (error) {
      console.error('Error in extractTextFromImage:', error);
      throw error;
    }
  }
};

export default geminiService; 