// backend/src/routes/ai.ts
// مسیرهای API مربوط به سرویس‌های هوش مصنوعی

import { Router } from 'express';
import { 
  chatWithGemini, 
  continueConversation, 
  createConversation, 
  analyzeImage 
} from '../controllers/aiController';
import { authenticateToken } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// تمام مسیرها نیاز به احراز هویت دارند
router.use(authenticateToken);

// مسیرهای چت
router.post('/chat', rateLimiter.ai, chatWithGemini);

// مسیرهای مکالمه
router.post('/conversations', rateLimiter.ai, createConversation);
router.post('/conversations/:conversationId/messages', rateLimiter.ai, continueConversation);

// مسیرهای تصویر
router.post('/images/analyze', rateLimiter.ai, analyzeImage);

/**
 * @route   POST /api/v1/ai/generate
 * @desc    Generate AI response
 * @access  Private
 */
router.post('/generate', rateLimiter.ai, (req, res) => {
  // Placeholder for AI generation
  res.status(200).json({
    success: true,
    data: {
      id: '1',
      prompt: req.body.prompt,
      response: 'این یک پاسخ نمونه از هوش مصنوعی است.',
      createdAt: new Date().toISOString()
    }
  });
});

/**
 * @route   GET /api/v1/ai/models
 * @desc    Get available AI models
 * @access  Private
 */
router.get('/models', (req, res) => {
  // Placeholder for getting AI models
  res.status(200).json({
    success: true,
    data: [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        description: 'مدل متنی Gemini Pro از Google',
        maxTokens: 30720
      },
      {
        id: 'gemini-pro-vision',
        name: 'Gemini Pro Vision',
        description: 'مدل چندرسانه‌ای Gemini Pro از Google',
        maxTokens: 16384
      }
    ]
  });
});

/**
 * @route   POST /api/v1/ai/images/analyze
 * @desc    Analyze image with AI
 * @access  Private
 */
router.post('/images/analyze', rateLimiter.ai, (req, res) => {
  // Placeholder for image analysis
  res.status(200).json({
    success: true,
    data: {
      id: '1',
      analysis: 'این یک تحلیل نمونه از تصویر است.',
      createdAt: new Date().toISOString()
    }
  });
});

export default router; 