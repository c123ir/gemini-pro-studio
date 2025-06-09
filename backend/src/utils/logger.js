"use strict";
// backend/src/utils/logger.ts
// Logging Configuration and Utilities
// Path: backend/src/utils/logger.ts
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganStream = exports.LoggerUtils = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Create logs directory if it doesn't exist
const logsDir = path_1.default.join(__dirname, '../../logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
// Persian date formatter
const persianDate = () => {
    const now = new Date();
    const options = {
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
const customFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({
    format: () => persianDate()
}), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.printf((_a) => {
    var { level, message, timestamp, stack } = _a, meta = __rest(_a, ["level", "message", "timestamp", "stack"]);
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
        log += `\n${stack}`;
    }
    return log;
}));
// Console format for development
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({
    format: () => persianDate()
}), winston_1.default.format.printf((_a) => {
    var { level, message, timestamp } = _a, meta = __rest(_a, ["level", "message", "timestamp"]);
    let log = `${timestamp} ${level}: ${message}`;
    if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return log;
}));
// Create transports
const transports = [];
// Console transport (development)
if (process.env.NODE_ENV === 'development') {
    transports.push(new winston_1.default.transports.Console({
        format: consoleFormat,
        level: process.env.LOG_LEVEL || 'debug'
    }));
}
// File transport (production)
if (process.env.NODE_ENV === 'production') {
    transports.push(new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'error.log'),
        level: 'error',
        format: customFormat,
        maxsize: parseInt(process.env.LOG_MAX_SIZE || '10485760'), // 10MB
        maxFiles: parseInt(process.env.LOG_MAX_FILES || '5')
    }), new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'combined.log'),
        format: customFormat,
        maxsize: parseInt(process.env.LOG_MAX_SIZE || '10485760'), // 10MB
        maxFiles: parseInt(process.env.LOG_MAX_FILES || '5')
    }));
}
// Create logger
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
    transports,
    exitOnError: false,
    // Handle uncaught exceptions
    exceptionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'exceptions.log'),
            format: customFormat
        })
    ],
    // Handle unhandled rejections
    rejectionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'rejections.log'),
            format: customFormat
        })
    ]
});
// Add console transport for development
if (process.env.NODE_ENV === 'development') {
    exports.logger.add(new winston_1.default.transports.Console({
        format: consoleFormat
    }));
}
// Logger utility class
class LoggerUtils {
    // Log API request
    static logRequest(req, res, responseTime) {
        var _a;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null,
            timestamp: new Date().toISOString()
        };
        if (res.statusCode >= 400) {
            exports.logger.warn('API Request with error:', logData);
        }
        else {
            exports.logger.info('API Request:', logData);
        }
    }
    // Log user activity
    static logUserActivity(userId, action, details) {
        exports.logger.info('User Activity:', {
            userId,
            action,
            details: details || {},
            timestamp: new Date().toISOString()
        });
    }
    // Log AI API usage
    static logAIUsage(userId, model, tokens, cost) {
        exports.logger.info('AI API Usage:', {
            userId,
            model,
            tokens,
            cost,
            timestamp: new Date().toISOString()
        });
    }
    // Log security events
    static logSecurityEvent(type, details, severity = 'medium') {
        exports.logger.warn('Security Event:', {
            type,
            severity,
            details,
            timestamp: new Date().toISOString()
        });
    }
    // Log performance metrics
    static logPerformance(operation, duration, metadata) {
        exports.logger.info('Performance Metric:', {
            operation,
            duration: `${duration}ms`,
            metadata: metadata || {},
            timestamp: new Date().toISOString()
        });
    }
    // Log database operations
    static logDatabase(operation, table, duration, error) {
        const logData = {
            operation,
            table,
            duration: duration ? `${duration}ms` : undefined,
            timestamp: new Date().toISOString()
        };
        if (error) {
            exports.logger.error('Database Error:', Object.assign(Object.assign({}, logData), { error: error.message }));
        }
        else {
            exports.logger.debug('Database Operation:', logData);
        }
    }
    // Log file operations
    static logFileOperation(operation, fileName, fileSize, userId) {
        exports.logger.info('File Operation:', {
            operation,
            fileName,
            fileSize,
            userId,
            timestamp: new Date().toISOString()
        });
    }
    // Log system health
    static logSystemHealth(metrics) {
        exports.logger.info('System Health:', Object.assign(Object.assign({}, metrics), { timestamp: new Date().toISOString() }));
    }
}
exports.LoggerUtils = LoggerUtils;
// Stream for Morgan (HTTP request logging)
exports.morganStream = {
    write: (message) => {
        exports.logger.info(message.trim());
    }
};
// Export default logger
exports.default = exports.logger;
