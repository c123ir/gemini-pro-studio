"use strict";
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
exports.DatabaseUtils = exports.closeDatabaseConnection = exports.prisma = exports.connectDatabase = void 0;
console.log('[DATABASE_TS_ULTRA_SIMPLIFIED] File execution started.');
const connectDatabase = () => { console.log('[DATABASE_TS_ULTRA_SIMPLIFIED] connectDatabase (placeholder) called'); };
exports.connectDatabase = connectDatabase;
exports.prisma = { ultra_placeholder: true, $connect: () => { console.log('[DATABASE_TS_ULTRA_SIMPLIFIED] prisma.$connect (placeholder) called'); } }; // Ultra simplified placeholder
/*
// backend/src/config/database.ts
console.log('[DATABASE_TS_TOP] File execution started.');
// Database Configuration and Connection
// Path: backend/src/config/database.ts

console.log('[DATABASE_TS_IMPORT_ATTEMPT] Attempting to import @prisma/client...');
import { PrismaClient } from '@prisma/client';
console.log('[DATABASE_TS_IMPORT_SUCCESS] Successfully imported @prisma/client.');
console.log('[DATABASE_TS_IMPORT_ATTEMPT] Attempting to import ../utils/logger...');
import { logger } from '../utils/logger';
console.log('[DATABASE_TS_IMPORT_SUCCESS] Successfully imported ../utils/logger.');

// Prisma Client instance
console.log('[DATABASE_TS_PRISMA_CLIENT] Attempting to create new PrismaClient instance...');
console.log(`[DATABASE_TS_PRISMA_CLIENT] DATABASE_URL from env: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET or EMPTY'}`);
export const prisma = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'event',
            level: 'error',
        },
        {
            emit: 'event',
            level: 'info',
        },
        {
            emit: 'event',
            level: 'warn',
        },
    ],
    errorFormat: 'pretty',
});
console.log('[DATABASE_TS_PRISMA_CLIENT] PrismaClient instance created successfully.');

// Define types for Prisma events
interface PrismaQueryEvent {
    query: string;
    params: string;
    duration: number;
    target: string;
    timestamp?: Date;
}

interface PrismaLogEvent {
    target: string;
    message: string;
    timestamp: Date;
}

/**
 * Connect to the database
 */
const connectDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Placeholder for database connection
        logger.info('Database connected successfully');
    }
    catch (error) {
        logger.error('Database connection failed:', error);
        throw error;
    }
});
exports.connectDatabase = connectDatabase;
// Setup Prisma logging
function setupPrismaLogging() {
    if (process.env.NODE_ENV === 'development') {
        exports.prisma.$on('query', (e) => {
            logger.debug('Query executed:', {
                query: e.query,
                params: e.params,
                duration: `${e.duration}ms`,
                target: e.target
            });
        });
    }
    exports.prisma.$on('error', (e) => {
        logger.error('Prisma error:', {
            target: e.target,
            message: e.message,
            timestamp: e.timestamp
        });
    });
    exports.prisma.$on('info', (e) => {
        logger.info('Prisma info:', {
            target: e.target,
            message: e.message,
            timestamp: e.timestamp
        });
    });
    exports.prisma.$on('warn', (e) => {
        logger.warn('Prisma warning:', {
            target: e.target,
            message: e.message,
            timestamp: e.timestamp
        });
    });
}
// Connection monitoring
function setupConnectionMonitoring() {
    // Monitor connection health
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.prisma.$queryRaw `SELECT 1`;
        }
        catch (error) {
            logger.error('Database health check failed:', error);
        }
    }), 60000); // Check every minute
}
/**
 * Close database connection
 */
const closeDatabaseConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Placeholder for closing database connection
        logger.info('Database connection closed');
    }
    catch (error) {
        logger.error('Error closing database connection:', error);
    }
});
exports.closeDatabaseConnection = closeDatabaseConnection;
// Database utilities
class DatabaseUtils {
    // Transaction wrapper
    static transaction(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield exports.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                return yield callback(tx);
            }));
        });
    }
    // Health check
    static healthCheck() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield exports.prisma.$queryRaw `SELECT 1`;
                return true;
            }
            catch (error) {
                logger.error('Database health check failed:', error);
                return false;
            }
        });
    }
    // Get database statistics
    static getStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [userCount, conversationCount, messageCount, fileCount] = yield Promise.all([
                    exports.prisma.user.count(),
                    exports.prisma.conversation.count(),
                    exports.prisma.message.count(),
                    exports.prisma.file.count()
                ]);
                return {
                    users: userCount,
                    conversations: conversationCount,
                    messages: messageCount,
                    files: fileCount,
                    timestamp: new Date().toISOString()
                };
            }
            catch (error) {
                logger.error('Failed to get database stats:', error);
                throw error;
            }
        });
    }
    // Clean up old data
    static cleanup() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                // Clean up old sessions
                yield exports.prisma.session.deleteMany({
                    where: {
                        expiresAt: {
                            lt: new Date()
                        }
                    }
                });
                // Clean up old activity logs
                yield exports.prisma.activityLog.deleteMany({
                    where: {
                        createdAt: {
                            lt: thirtyDaysAgo
                        }
                    }
                });
                logger.info('Database cleanup completed');
            }
            catch (error) {
                logger.error('Database cleanup failed:', error);
                throw error;
            }
        });
    }
}
exports.DatabaseUtils = DatabaseUtils;
// Export for middleware and services
exports.default = exports.prisma;
