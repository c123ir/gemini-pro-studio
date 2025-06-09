import express from 'express';
import cors from 'cors';

const app = express();
const port = 5150;

// CORS
app.use(cors());

// Body parser
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ورود موفقیت‌آمیز',
    data: {
      user: {
        id: '1',
        name: 'کاربر نمونه',
        email: 'user@example.com',
        role: 'user'
      },
      token: 'sample-token'
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'ثبت‌نام موفقیت‌آمیز',
    data: {
      user: {
        id: '2',
        name: req.body.name || 'کاربر جدید',
        email: req.body.email || 'new@example.com',
        role: 'user'
      },
      token: 'sample-token'
    }
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    name: 'Gemini Pro Studio Test API',
    version: '1.0.0',
    status: 'active'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Test server running on port ${port}`);
}); 