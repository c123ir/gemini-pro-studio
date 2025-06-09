// backend/src/config/redis.ts
// Redis configuration and connection setup

import { createClient } from 'redis';
import { logger } from '../utils/logger';

// Redis client singleton
let redisClient: any = null;

/**
 * Setup Redis connection
 */
export const setupRedis = async (): Promise<void> => {
  try {
    if (!process.env.REDIS_URL) {
      logger.warn('REDIS_URL not provided, Redis functionality will be disabled');
      return;
    }

    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    // Handle Redis errors
    redisClient.on('error', (err: Error) => {
      logger.error('Redis error:', err);
    });

    // Connect to Redis
    await redisClient.connect();
    
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.error('Redis connection failed:', error);
    // Don't throw error, allow application to run without Redis
  }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = () => {
  if (!redisClient) {
    logger.warn('Redis client accessed before initialization');
    return null;
  }
  return redisClient;
};

/**
 * Check if Redis is connected
 */
export const isRedisConnected = (): boolean => {
  return redisClient?.isReady || false;
};

/**
 * Close Redis connection
 */
export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient && redisClient.isReady) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
}; 