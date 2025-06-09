"use strict";
// backend/src/config/redis.ts
// Redis configuration and connection setup
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeRedisConnection = exports.isRedisConnected = exports.getRedisClient = exports.setupRedis = void 0;
const redis_1 = require("redis");
const logger_1 = require("../utils/logger");
// Redis client singleton
let redisClient = null;
/**
 * Setup Redis connection
 */
const setupRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!process.env.REDIS_URL) {
            logger_1.logger.warn('REDIS_URL not provided, Redis functionality will be disabled');
            return;
        }
        redisClient = (0, redis_1.createClient)({
            url: process.env.REDIS_URL,
        });
        // Handle Redis errors
        redisClient.on('error', (err) => {
            logger_1.logger.error('Redis error:', err);
        });
        // Connect to Redis
        yield redisClient.connect();
        logger_1.logger.info('Redis connected successfully');
    }
    catch (error) {
        logger_1.logger.error('Redis connection failed:', error);
        // Don't throw error, allow application to run without Redis
    }
});
exports.setupRedis = setupRedis;
/**
 * Get Redis client instance
 */
const getRedisClient = () => {
    if (!redisClient) {
        logger_1.logger.warn('Redis client accessed before initialization');
        return null;
    }
    return redisClient;
};
exports.getRedisClient = getRedisClient;
/**
 * Check if Redis is connected
 */
const isRedisConnected = () => {
    return (redisClient === null || redisClient === void 0 ? void 0 : redisClient.isReady) || false;
};
exports.isRedisConnected = isRedisConnected;
/**
 * Close Redis connection
 */
const closeRedisConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    if (redisClient && redisClient.isReady) {
        yield redisClient.quit();
        logger_1.logger.info('Redis connection closed');
    }
});
exports.closeRedisConnection = closeRedisConnection;
