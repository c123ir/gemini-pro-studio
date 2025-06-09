// backend/src/utils/logger.ts
// Logging Configuration and Utilities
// Path: backend/src/utils/logger.ts

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Persian date formatter
const persianDate = (): string => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Tehran',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    return new Intl.DateTimeFormat('fa-IR', options).format(now);
};

// Custom format
const customFormat = winston.format.combine(
    winston.format.timestamp({
        format: () => persianDate()
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
        
        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }
        
        if (stack) {
            log += `\n${stack}`;
        }
        
        return log;
    })
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
        format: () => persianDate()
    }),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
        let log = `${timestamp} ${level}: ${message}`;
        
        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta, null, 2)}`;
        }
        
        return log;
    })
);

// Create transports
const transports: winston.transport[] = [];

// Console transport (development)
if (process.env.NODE_ENV === 'development') {
    transports.push(
        new winston.transports.Console({
            format: consoleFormat,
            level: process.env.LOG_LEVEL || 'debug'
        })
    );
}

// File transport (production)
if (process.env.NODE_ENV === 'production') {
    transports.push(
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            format: customFormat,
            maxsize: parseInt(process.env.LOG_MAX_SIZE || '10485760'), // 10MB
            maxFiles: parseInt(process.env.LOG_MAX_FILES || '5')
        }),
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            format: customFormat,
            maxsize: parseInt(process.env.LOG_MAX_SIZE || '10485760'), // 10MB
            maxFiles: parseInt(process.env.LOG_MAX_FILES || '5')
        })
    );
}

// Create logger
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    transports,
    exitOnError: false,
    // Handle uncaught exceptions
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'exceptions.log'),
            format: customFormat
        })
    ],
    // Handle unhandled rejections
    rejectionHandlers: [
        new winston.transports.File({
            filename: path.join(logsDir, 'rejections.log'),
            format: customFormat
        })
    ]
});

// Add console transport for development
if (process.env.NODE_ENV === 'development') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

// Logger utility class
export class LoggerUtils {
    // Log API request
    static logRequest(req: any, res: any, responseTime: number) {
        const logData = {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            userId: req.user?.id || null,
            timestamp: new Date().toISOString()
        };

        if (res.statusCode >= 400) {
            logger.warn('API Request with error:', logData);
        } else {
            logger.info('API Request:', logData);
        }
    }

    // Log user activity
    static logUserActivity(userId: number, action: string, details?: any) {
        logger.info('User Activity:', {
            userId,
            action,
            details: details || {},
            timestamp: new Date().toISOString()
        });
    }

    // Log AI API usage
    static logAIUsage(userId: number, model: string, tokens: number, cost: number) {
        logger.info('AI API Usage:', {
            userId,
            model,
            tokens,
            cost,
            timestamp: new Date().toISOString()
        });
    }

    // Log security events
    static logSecurityEvent(type: string, details: any, severity: 'low' | 'medium' | 'high' = 'medium') {
        logger.warn('Security Event:', {
            type,
            severity,
            details,
            timestamp: new Date().toISOString()
        });
    }

    // Log performance metrics
    static logPerformance(operation: string, duration: number, metadata?: any) {
        logger.info('Performance Metric:', {
            operation,
            duration: `${duration}ms`,
            metadata: metadata || {},
            timestamp: new Date().toISOString()
        });
    }

    // Log database operations
    static logDatabase(operation: string, table: string, duration?: number, error?: any) {
        const logData = {
            operation,
            table,
            duration: duration ? `${duration}ms` : undefined,
            timestamp: new Date().toISOString()
        };

        if (error) {
            logger.error('Database Error:', { ...logData, error: error.message });
        } else {
            logger.debug('Database Operation:', logData);
        }
    }

    // Log file operations
    static logFileOperation(operation: string, fileName: string, fileSize?: number, userId?: number) {
        logger.info('File Operation:', {
            operation,
            fileName,
            fileSize,
            userId,
            timestamp: new Date().toISOString()
        });
    }

    // Log system health
    static logSystemHealth(metrics: any) {
        logger.info('System Health:', {
            ...metrics,
            timestamp: new Date().toISOString()
        });
    }
}

// Stream for Morgan (HTTP request logging)
export const morganStream = {
    write: (message: string) => {
        logger.info(message.trim());
    }
};

// Export default logger
export default logger;