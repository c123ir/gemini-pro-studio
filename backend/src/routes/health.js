"use strict";
// backend/src/routes/health.ts
// Health check routes
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const redis_1 = require("../config/redis");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
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
            ? ((0, redis_1.isRedisConnected)() ? 'connected' : 'disconnected')
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
    }
    catch (error) {
        logger_1.logger.error('Health check error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Health check failed',
            timestamp: new Date().toISOString()
        });
    }
});
exports.default = router;
