// backend/src/routes/health.ts
// Health check routes

import { Router } from 'express';
import { isRedisConnected } from '../config/redis';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

/**
 * @route   GET /api/v1/health/detailed
 * @desc    Detailed health check
 * @access  Private
 */
router.get('/detailed', (req, res) => {
  try {
    // Check Redis connection if configured
    const redisStatus = process.env.REDIS_URL 
      ? (isRedisConnected() ? 'connected' : 'disconnected') 
      : 'not_configured';
    
    // Check database connection
    const dbStatus = 'connected'; // Placeholder - should check actual connection
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        redis: redisStatus,
        database: dbStatus
      },
      memory: {
        usage: process.memoryUsage(),
        free: process.memoryUsage().heapTotal - process.memoryUsage().heapUsed
      }
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 