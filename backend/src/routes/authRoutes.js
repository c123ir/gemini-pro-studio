"use strict";
// backend/src/routes/authRoutes.ts
// مسیرهای احراز هویت - Backend Routes
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// Public routes (no authentication required)
router.post('/register', rateLimiter_1.rateLimiter.auth, authController_1.register);
router.post('/login', rateLimiter_1.rateLimiter.auth, authController_1.login);
// Protected routes (authentication required)
router.use(auth_1.authenticateToken); // Apply authentication middleware to all routes below
router.get('/profile', authController_1.getProfile);
router.put('/profile', authController_1.updateProfile);
router.put('/change-password', rateLimiter_1.rateLimiter.password, authController_1.changePassword);
router.post('/logout', authController_1.logout);
exports.default = router;
