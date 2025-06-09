// backend/src/services/geminiService.ts
// سرویس ارتباط با Google AI API

import axios from 'axios';
import { logger } from '../utils/logger';

interface Message {
  role: string;
  content: string;
}

interface ChatConfig {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

interface ChatResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface ImageResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Google AI API URLs
const API_URL = 'https://generativelanguage.googleapis.com/v1beta';
const API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * سرویس ارتباط با Google AI API
 */
export const geminiService = {
  /**
   * تولید پاسخ چت با استفاده از Gemini API
   */
  generateChatResponse: async (
    messages: Message[],
    modelName: string = 'gemini-pro',
    config: ChatConfig = {}
  ): Promise<ChatResponse> => {
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
      const response = await axios.post(
        `${API_URL}/models/${modelName}:generateContent?key=${API_KEY}`,
        requestParams
      );

      // استخراج پاسخ
      const generatedText = response.data.candidates[0]?.content?.parts[0]?.text || '';
      
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
    } catch (error) {
      logger.error('Error in generateChatResponse:', error);
      throw new Error('خطا در ارتباط با Gemini API');
    }
  },

  /**
   * تحلیل تصویر با استفاده از Gemini Vision API
   */
  analyzeImage: async (
    imageUrl: string,
    prompt?: string,
    modelName: string = 'gemini-pro-vision'
  ): Promise<ImageResponse> => {
    try {
      // بررسی اینکه آیا URL باید تبدیل به base64 شود یا نه
      let imageData;
      if (imageUrl.startsWith('data:image')) {
        // داده تصویر به صورت base64 ارسال شده است
        imageData = imageUrl;
      } else {
        // دریافت تصویر از URL
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
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
      const response = await axios.post(
        `${API_URL}/models/${modelName}:generateContent?key=${API_KEY}`,
        requestParams
      );

      // استخراج پاسخ
      const analysisText = response.data.candidates[0]?.content?.parts[0]?.text || '';
      
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
    } catch (error) {
      logger.error('Error in analyzeImage:', error);
      throw new Error('خطا در تحلیل تصویر با Gemini Vision API');
    }
  }
};

/**
 * تخمین تعداد توکن‌های یک متن
 * این یک تخمین ساده است و در یک محیط واقعی باید از کتابخانه‌های دقیق‌تر استفاده شود
 */
function estimateTokenCount(text: string): number {
  // تخمین میانگین: هر 4 کاراکتر تقریباً 1 توکن است
  return Math.ceil(text.length / 4);
}

export default geminiService; 