const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('[SIMPLE_SERVER] Starting enhanced simple server...');

// ===== اطلاعات موقت برای تست =====
// این داده‌ها فقط برای آزمایش هستند و در نسخه واقعی باید از دیتابیس استفاده شود

// کاربران آزمایشی
const users = [
  {
    id: '1',
    name: 'کاربر آزمایشی',
    email: 'test@example.com',
    password: '123456', // در محیط واقعی رمز عبور باید هش شود
    role: 'user',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'مدیر سیستم',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// گفتگوهای آزمایشی
const conversations = [
  {
    id: '1',
    userId: '1',
    title: 'گفتگوی آزمایشی',
    description: 'این یک گفتگوی آزمایشی است',
    modelName: 'gemini-pro',
    systemPrompt: 'شما یک دستیار هوشمند و مفید هستید.',
    temperature: 0.7,
    maxTokens: 1000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastMessageAt: new Date().toISOString(),
    messageCount: 2
  }
];

// پیام‌های آزمایشی
const messages = [
  {
    id: '1',
    conversationId: '1',
    userId: '1',
    role: 'user',
    content: 'سلام، حالت چطوره؟',
    contentType: 'text',
    createdAt: new Date(Date.now() - 60000).toISOString()
  },
  {
    id: '2',
    conversationId: '1',
    userId: '1',
    role: 'assistant',
    content: 'سلام! من حالم خوبه، ممنون از شما. چطور می‌تونم کمکتون کنم؟',
    contentType: 'text',
    createdAt: new Date().toISOString()
  }
];

// ===== راه‌اندازی سرور =====
const app = express();

// میدل‌ویرها
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3150',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// فولدر برای فایل‌های آپلود شده
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ===== میدل‌ویرها =====

// میدل‌ویر احراز هویت
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false, 
      message: 'توکن احراز هویت ارائه نشده است.' 
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ 
      success: false, 
      message: 'توکن نامعتبر یا منقضی شده است.' 
    });
  }
};

// میدل‌ویر بررسی دسترسی مدیر
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'دسترسی غیرمجاز. فقط مدیران می‌توانند به این منبع دسترسی داشته باشند.' 
    });
  }
};

// ===== مسیرهای API =====

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Gemini Pro Studio API (Enhanced Simple Server)',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      conversations: '/api/conversations',
      ai: '/api/v1/ai',
      health: '/health'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// ===== مسیرهای احراز هویت =====
const authRoutes = express.Router();

// ورود
authRoutes.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // بررسی اعتبار
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'ایمیل و رمز عبور الزامی هستند.' 
      });
    }
    
    // یافتن کاربر
    const user = users.find(u => u.email === email);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: 'ایمیل یا رمز عبور نادرست است.' 
      });
    }
    
    // ایجاد توکن JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // حذف رمز عبور از پاسخ
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'ورود با موفقیت انجام شد.',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در ورود به سیستم.' 
    });
  }
});

// ثبت‌نام
authRoutes.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // بررسی اعتبار
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'نام، ایمیل و رمز عبور الزامی هستند.' 
      });
    }
    
    // بررسی تکراری بودن ایمیل
    if (users.some(u => u.email === email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'این ایمیل قبلاً ثبت شده است.' 
      });
    }
    
    // ایجاد کاربر جدید
    const newUser = {
      id: String(users.length + 1),
      name,
      email,
      password,
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    // ایجاد توکن JWT
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // حذف رمز عبور از پاسخ
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'ثبت‌نام با موفقیت انجام شد.',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در ثبت‌نام.' 
    });
  }
});

// دریافت پروفایل
authRoutes.get('/profile', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'کاربر یافت نشد.' 
      });
    }
    
    // حذف رمز عبور از پاسخ
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در دریافت پروفایل کاربر.' 
    });
  }
});

// به‌روزرسانی پروفایل
authRoutes.put('/profile', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'کاربر یافت نشد.' 
      });
    }
    
    // به‌روزرسانی اطلاعات کاربر
    users[userIndex] = {
      ...users[userIndex],
      name: name || users[userIndex].name,
      updatedAt: new Date().toISOString()
    };
    
    // حذف رمز عبور از پاسخ
    const { password: _, ...userWithoutPassword } = users[userIndex];
    
    res.json({
      success: true,
      message: 'پروفایل با موفقیت به‌روزرسانی شد.',
      data: {
        user: userWithoutPassword
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در به‌روزرسانی پروفایل کاربر.' 
    });
  }
});

// خروج
authRoutes.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'خروج با موفقیت انجام شد.'
  });
});

// ===== مسیرهای گفتگو =====
const conversationRoutes = express.Router();

// دریافت همه گفتگوها
conversationRoutes.get('/', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    const userConversations = conversations.filter(c => c.userId === userId);
    
    res.json({
      success: true,
      data: userConversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در دریافت گفتگوها.' 
    });
  }
});

// ایجاد گفتگوی جدید
conversationRoutes.post('/', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, modelName, systemPrompt } = req.body;
    
    if (!title) {
      return res.status(400).json({ 
        success: false, 
        message: 'عنوان گفتگو الزامی است.' 
      });
    }
    
    const newConversation = {
      id: String(conversations.length + 1),
      userId,
      title,
      description: description || '',
      modelName: modelName || 'gemini-pro',
      systemPrompt: systemPrompt || 'شما یک دستیار هوشمند و مفید هستید.',
      temperature: 0.7,
      maxTokens: 1000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      messageCount: 0
    };
    
    conversations.push(newConversation);
    
    res.status(201).json({
      success: true,
      message: 'گفتگو با موفقیت ایجاد شد.',
      data: newConversation
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در ایجاد گفتگو.' 
    });
  }
});

// دریافت یک گفتگو با شناسه
conversationRoutes.get('/:id', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.id;
    
    const conversation = conversations.find(c => c.id === conversationId && c.userId === userId);
    
    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        message: 'گفتگو یافت نشد.' 
      });
    }
    
    // دریافت پیام‌های این گفتگو
    const conversationMessages = messages.filter(m => m.conversationId === conversationId);
    
    res.json({
      success: true,
      data: {
        conversation,
        messages: conversationMessages
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در دریافت گفتگو.' 
    });
  }
});

// ===== مسیرهای پیام =====
const messageRoutes = express.Router();

// دریافت پیام‌های یک گفتگو
messageRoutes.get('/', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.query;
    
    if (!conversationId) {
      return res.status(400).json({ 
        success: false, 
        message: 'شناسه گفتگو الزامی است.' 
      });
    }
    
    // بررسی دسترسی به گفتگو
    const conversation = conversations.find(c => c.id === conversationId && c.userId === userId);
    
    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        message: 'گفتگو یافت نشد.' 
      });
    }
    
    // دریافت پیام‌های این گفتگو
    const conversationMessages = messages.filter(m => m.conversationId === conversationId);
    
    res.json({
      success: true,
      data: conversationMessages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در دریافت پیام‌ها.' 
    });
  }
});

// ارسال پیام جدید
messageRoutes.post('/', authenticateJWT, (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId, content, role = 'user' } = req.body;
    
    if (!conversationId || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'شناسه گفتگو و محتوای پیام الزامی هستند.' 
      });
    }
    
    // بررسی دسترسی به گفتگو
    const conversationIndex = conversations.findIndex(c => c.id === conversationId && c.userId === userId);
    
    if (conversationIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'گفتگو یافت نشد.' 
      });
    }
    
    // ایجاد پیام جدید کاربر
    const userMessage = {
      id: String(messages.length + 1),
      conversationId,
      userId,
      role,
      content,
      contentType: 'text',
      createdAt: new Date().toISOString()
    };
    
    messages.push(userMessage);
    
    // به‌روزرسانی گفتگو
    conversations[conversationIndex].messageCount += 1;
    conversations[conversationIndex].lastMessageAt = new Date().toISOString();
    conversations[conversationIndex].updatedAt = new Date().toISOString();
    
    // شبیه‌سازی پاسخ هوش مصنوعی
    const aiResponses = [
      'من یک هوش مصنوعی هستم و می‌توانم به سوالات شما پاسخ دهم.',
      'ممنون از سوال شما! می‌توانم در این زمینه کمک کنم.',
      'این سوال جالبی است. اجازه دهید بیشتر توضیح دهم.',
      'بر اساس دانش من، پاسخ به این سوال به شرح زیر است.',
      'من برای کمک به شما اینجا هستم. دانش من تا سال 2023 است.'
    ];
    
    // انتخاب یک پاسخ تصادفی
    const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
    
    // ایجاد پاسخ هوش مصنوعی
    const aiMessage = {
      id: String(messages.length + 1),
      conversationId,
      userId,
      role: 'assistant',
      content: `${randomResponse} پاسخ به پیام شما: "${content}"`,
      contentType: 'text',
      createdAt: new Date().toISOString()
    };
    
    messages.push(aiMessage);
    
    // به‌روزرسانی مجدد گفتگو
    conversations[conversationIndex].messageCount += 1;
    conversations[conversationIndex].lastMessageAt = new Date().toISOString();
    conversations[conversationIndex].updatedAt = new Date().toISOString();
    
    res.status(201).json({
      success: true,
      message: 'پیام با موفقیت ارسال شد.',
      data: {
        userMessage,
        aiMessage
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در ارسال پیام.' 
    });
  }
});

// ===== مسیرهای هوش مصنوعی =====
const aiRoutes = express.Router();

// ارسال پیام به چت
aiRoutes.post('/chat', authenticateJWT, (req, res) => {
  try {
    const { messages: chatMessages, config } = req.body;
    
    if (!chatMessages || !Array.isArray(chatMessages)) {
      return res.status(400).json({ 
        success: false, 
        message: 'پیام‌های چت الزامی هستند و باید آرایه باشند.' 
      });
    }
    
    // شبیه‌سازی پردازش هوش مصنوعی
    const lastUserMessage = chatMessages.filter(m => m.role === 'user').pop();
    
    if (!lastUserMessage) {
      return res.status(400).json({ 
        success: false, 
        message: 'حداقل یک پیام کاربر باید وجود داشته باشد.' 
      });
    }
    
    // شبیه‌سازی پاسخ
    const aiResponse = {
      response: `این یک پاسخ شبیه‌سازی شده به پیام شما است: "${lastUserMessage.content}"`,
      modelName: config?.modelName || 'gemini-pro',
      promptTokens: Math.floor(Math.random() * 100) + 50,
      completionTokens: Math.floor(Math.random() * 200) + 100,
      totalTokens: Math.floor(Math.random() * 300) + 150,
      processingTime: Math.floor(Math.random() * 1000) + 500
    };
    
    res.json({
      success: true,
      data: aiResponse
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در پردازش چت هوش مصنوعی.' 
    });
  }
});

// تحلیل تصویر
aiRoutes.post('/images/analyze', authenticateJWT, (req, res) => {
  try {
    const { imageUrl, prompt } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'URL تصویر الزامی است.' 
      });
    }
    
    // شبیه‌سازی تحلیل تصویر
    const analysis = {
      analysis: `این یک تحلیل شبیه‌سازی شده از تصویر است. ${prompt ? `با توجه به پرامپت: "${prompt}"` : ''}`,
      modelName: 'gemini-pro-vision',
      processingTime: Math.floor(Math.random() * 2000) + 1000
    };
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'خطا در تحلیل تصویر.' 
    });
  }
});

// ===== ثبت مسیرها =====
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/v1/ai', aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'مسیر مورد نظر یافت نشد.'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'خطای داخلی سرور.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ===== راه‌اندازی سرور =====
const PORT = process.env.PORT || 5150;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`✅ Enhanced simple server is running on http://${HOST}:${PORT}`);
  console.log('📚 Available API endpoints:');
  console.log('  - Auth: /api/auth/login, /api/auth/register, /api/auth/profile');
  console.log('  - Conversations: /api/conversations');
  console.log('  - Messages: /api/messages');
  console.log('  - AI: /api/v1/ai/chat, /api/v1/ai/images/analyze');
});

// Keep the process alive
setInterval(() => {
  console.log(`[KEEP_ALIVE] Server uptime: ${process.uptime()} seconds`);
}, 60000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit(0);
}); 