// backend/src/routes/authRoutes.ts
// مسیرهای احراز هویت - Backend Routes

import { Router } from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword,
  logout 
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes (no authentication required)
router.post('/register', rateLimiter.auth, register);
router.post('/login', rateLimiter.auth, login);

// Protected routes (authentication required)
router.use(authenticateToken); // Apply authentication middleware to all routes below

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', rateLimiter.password, changePassword);
router.post('/logout', logout);

export default router;