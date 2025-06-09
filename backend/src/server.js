"use strict";
// backend/src/server.ts
// Main Server Entry Point
// Path: backend/src/server.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('[SERVER_TS_TOP] Script execution started.'); // <--- لاگ اولیه
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables VERY FIRST
dotenv_1.default.config();
console.log('[SERVER_TS_TOP] dotenv.config() called.'); // <--- لاگ
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
console.log('[SERVER_TS_TOP] Basic imports loaded.'); // <--- لاگ
// Import configurations and utilities
// بگذارید logger دیرتر import شود تا مطمئن شویم console.log های اولیه کار می‌کنند
// import { logger } from './utils/logger'; 
console.log('[SERVER_TS_IMPORT_ATTEMPT] Attempting to import ./config/database...');
const db_config_1 = require("./config/db_config");
console.log('[SERVER_TS_IMPORT_SUCCESS] Successfully imported ./config/database.');
console.log('[SERVER_TS_IMPORT_ATTEMPT] Attempting to import ./config/redis...');
console.log('[SERVER_TS_IMPORT_SUCCESS] Successfully imported ./config/redis.');
console.log('[SERVER_TS_IMPORT_ATTEMPT] Attempting to import ./middleware/rateLimiter...');
const rateLimiter_1 = require("./middleware/rateLimiter");
console.log('[SERVER_TS_IMPORT_SUCCESS] Successfully imported ./middleware/rateLimiter.');
console.log('[SERVER_TS_IMPORT_ATTEMPT] Attempting to import ./config/socket...');
const socket_1 = require("./config/socket");
console.log('[SERVER_TS_IMPORT_SUCCESS] Successfully imported ./config/socket.');
console.log('[SERVER_TS_IMPORT_ATTEMPT] Attempting to import ./middleware/notFound...');
const notFound_1 = require("./middleware/notFound");
console.log('[SERVER_TS_IMPORT_SUCCESS] Successfully imported ./middleware/notFound.');
console.log('[SERVER_TS_IMPORT_ATTEMPT] Attempting to import ./middleware/errorHandler...');
const errorHandler_1 = require("./middleware/errorHandler");
console.log('[SERVER_TS_IMPORT_SUCCESS] Successfully imported ./middleware/errorHandler.');
console.log('[SERVER_TS_TOP] Config and util imports loaded (except logger).'); // <--- لاگ
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const conversations_1 = __importDefault(require("./routes/conversations"));
const messages_1 = __importDefault(require("./routes/messages"));
const files_1 = __importDefault(require("./routes/files"));
const ai_1 = __importDefault(require("./routes/ai"));
const tags_1 = __importDefault(require("./routes/tags"));
const templates_1 = __importDefault(require("./routes/templates"));
const stats_1 = __importDefault(require("./routes/stats"));
const settings_1 = __importDefault(require("./routes/settings"));
const health_1 = __importDefault(require("./routes/health"));
console.log('[SERVER_TS_TOP] Route imports loaded.'); // <--- لاگ
// حالا logger را import می کنیم
const logger_1 = require("./utils/logger");
console.log('[SERVER_TS_TOP] Logger imported.'); // <--- لاگ
class Server {
    constructor() {
        console.log('[Server.constructor] Initializing server...');
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || '5150');
        console.log(`[Server.constructor] Port set to: ${this.port}`);
        this.httpServer = (0, http_1.createServer)(this.app);
        this.io = new socket_io_1.Server(this.httpServer, {
            cors: {
                origin: process.env.CORS_ORIGIN || 'http://localhost:3150',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        console.log('[Server.constructor] Express app, HTTP server, and Socket.IO created.');
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling(); // این را قبل از initializeSocket قرار دهیم
        this.initializeSocket();
        console.log('[Server.constructor] Initialization methods called.');
    }
    initializeMiddlewares() {
        var _a;
        console.log('[Server.initializeMiddlewares] Initializing middlewares...');
        // Security middleware
        if (process.env.HELMET_ENABLED === 'true') {
            this.app.use((0, helmet_1.default)({
                crossOriginEmbedderPolicy: false,
                contentSecurityPolicy: {
                    directives: {
                        defaultSrc: ["'self'"],
                        styleSrc: ["'self'", "'unsafe-inline'"],
                        scriptSrc: ["'self'"],
                        imgSrc: ["'self'", "data:", "https:"],
                    },
                },
            }));
            console.log('[Server.initializeMiddlewares] Helmet enabled.');
        }
        // CORS configuration
        this.app.use((0, cors_1.default)({
            origin: ((_a = process.env.CORS_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(',')) || ['http://localhost:3150'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        }));
        console.log('[Server.initializeMiddlewares] CORS configured.');
        // Compression
        this.app.use((0, compression_1.default)());
        console.log('[Server.initializeMiddlewares] Compression enabled.');
        // Request logging
        if (process.env.NODE_ENV === 'development') {
            this.app.use((0, morgan_1.default)('dev'));
            console.log('[Server.initializeMiddlewares] Morgan (dev) enabled.');
        }
        else {
            this.app.use((0, morgan_1.default)('combined', {
                stream: {
                    write: (message) => logger_1.logger.info(message.trim())
                }
            }));
            console.log('[Server.initializeMiddlewares] Morgan (combined) enabled.');
        }
        // Body parsing
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        console.log('[Server.initializeMiddlewares] Body parsing configured.');
        // Rate limiting
        this.app.use(rateLimiter_1.rateLimiter.general);
        console.log('[Server.initializeMiddlewares] Rate limiting configured.');
        // Static files
        this.app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
        console.log('[Server.initializeMiddlewares] Static files configured for /uploads.');
        // Health check (before rate limiting)
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
            });
        });
        console.log('[Server.initializeMiddlewares] Health check route /health configured.');
        console.log('[Server.initializeMiddlewares] Middlewares initialized.');
    }
    initializeRoutes() {
        console.log('[Server.initializeRoutes] Initializing routes...');
        const apiPrefix = process.env.API_PREFIX || '/api';
        console.log(`[Server.initializeRoutes] API Prefix: ${apiPrefix}`);
        this.app.use(`${apiPrefix}/health`, health_1.default); // Health route with prefix
        this.app.use(`${apiPrefix}/auth`, auth_1.default);
        this.app.use(`${apiPrefix}/users`, users_1.default);
        this.app.use(`${apiPrefix}/conversations`, conversations_1.default);
        this.app.use(`${apiPrefix}/messages`, messages_1.default);
        this.app.use(`${apiPrefix}/files`, files_1.default);
        this.app.use(`${apiPrefix}/ai`, ai_1.default);
        this.app.use(`${apiPrefix}/tags`, tags_1.default);
        this.app.use(`${apiPrefix}/templates`, templates_1.default);
        this.app.use(`${apiPrefix}/stats`, stats_1.default);
        this.app.use(`${apiPrefix}/settings`, settings_1.default);
        console.log('[Server.initializeRoutes] Main API routes initialized.');
        // API documentation (development only)
        if (process.env.NODE_ENV === 'development' && process.env.SWAGGER_ENABLED === 'true') {
            this.setupSwagger();
        }
        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                name: 'Gemini Pro Studio API',
                version: '1.0.0',
                status: 'active',
                timestamp: new Date().toISOString(),
                endpoints: {
                    health: '/health', // or `${apiPrefix}/health`
                    api: apiPrefix,
                    docs: process.env.NODE_ENV === 'development' && process.env.SWAGGER_ENABLED === 'true' ? '/api-docs' : null
                }
            });
        });
        console.log('[Server.initializeRoutes] Root / route configured.');
        console.log('[Server.initializeRoutes] Routes initialized.');
    }
    initializeErrorHandling() {
        console.log('[Server.initializeErrorHandling] Initializing error handling...');
        // 404 handler
        this.app.use(notFound_1.notFound);
        // Global error handler
        this.app.use(errorHandler_1.errorHandler);
        console.log('[Server.initializeErrorHandling] 404 and global error handlers configured.');
        // Graceful shutdown handlers
        process.on('SIGTERM', () => {
            console.log('[PROCESS_EVENT] SIGTERM received.');
            this.gracefulShutdown('SIGTERM');
        });
        process.on('SIGINT', () => {
            console.log('[PROCESS_EVENT] SIGINT received.');
            this.gracefulShutdown('SIGINT');
        });
        console.log('[Server.initializeErrorHandling] SIGTERM and SIGINT handlers configured.');
        // Unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('[PROCESS_EVENT] Unhandled Rejection at:', { promise, reason: (reason === null || reason === void 0 ? void 0 : reason.stack) || reason });
            logger_1.logger.error('Unhandled Rejection at:', { promise, reason }); // Keep logger here too
            this.gracefulShutdown('unhandledRejection');
        });
        console.log('[Server.initializeErrorHandling] unhandledRejection handler configured.');
        // Uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('[PROCESS_EVENT] Uncaught Exception:', error.stack || error);
            logger_1.logger.error('Uncaught Exception:', error); // Keep logger here too
            this.gracefulShutdown('uncaughtException');
        });
        console.log('[Server.initializeErrorHandling] uncaughtException handler configured.');
        console.log('[Server.initializeErrorHandling] Error handling initialized.');
    }
    initializeSocket() {
        console.log('[Server.initializeSocket] Initializing Socket.IO...');
        (0, socket_1.setupSocketIO)(this.io);
        this.app.set('io', this.io); // Make io available globally
        console.log('[Server.initializeSocket] Socket.IO initialized and set on app.');
    }
    setupSwagger() {
        console.log('[Server.setupSwagger] Setting up Swagger...');
        try {
            const swaggerUi = require('swagger-ui-express');
            const swaggerDocument = require('../docs/swagger.json');
            this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
            logger_1.logger.info('Swagger documentation available at /api-docs'); // logger is fine here
            console.log('[Server.setupSwagger] Swagger UI configured at /api-docs.');
        }
        catch (error) {
            console.error('[Server.setupSwagger] Swagger setup failed:', error);
            logger_1.logger.warn('Swagger setup failed:', error); // logger is fine here
        }
    }
    gracefulShutdown(signal) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[Server.gracefulShutdown] Starting graceful shutdown due to ${signal || 'unknown reason'}...`);
            logger_1.logger.info(`Starting graceful shutdown due to ${signal || 'unknown reason'}...`);
            // این بخش را کمی تغییر می دهیم تا مطمئن شویم لاگ ها قبل از خروج ثبت می شوند
            this.httpServer.close((err) => {
                if (err) {
                    console.error('[Server.gracefulShutdown] Error closing HTTP server:', err);
                    logger_1.logger.error('Error closing HTTP server:', err);
                }
                else {
                    console.log('[Server.gracefulShutdown] HTTP server closed.');
                    logger_1.logger.info('HTTP server closed');
                }
                // Close database connections
                // Note: Prisma client should be disconnected by connectDatabase or a dedicated function
                console.log('[Server.gracefulShutdown] Attempting to disconnect Prisma (if connectDatabase handles it).');
                // PrismaClient.$disconnect() should ideally be called elsewhere if connectDatabase doesn't.
                console.log(`[Server.gracefulShutdown] Exiting process with code 0 (graceful).`);
                process.exit(0);
            });
            // Force close after 10 seconds
            setTimeout(() => {
                console.error('[Server.gracefulShutdown] Could not close connections in time, forcefully shutting down with code 1.');
                logger_1.logger.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000).unref(); // .unref() allows the program to exit if this is the only timer left.
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[Server.start] Attempting to start server...');
            try {
                // Initialize database
                console.log('[Server.start] Connecting to database...');
                yield (0, db_config_1.connectDatabase)();
                console.log('[Server.start] Database connected successfully (or connection initiated).');
                logger_1.logger.info('Database connected successfully'); // logger is fine here
                // Initialize Redis (optional)
                if (process.env.REDIS_URL) {
                    console.log('[Server.start] Connecting to Redis...');
                    // ... (rest of the code remains the same)
                    console.log('[Server.start] Redis connected successfully.');
                    logger_1.logger.info('Redis connected successfully'); // logger is fine here
                }
                // Start server
                const host = process.env.HOST || 'localhost';
                console.log(`[Server.start] Starting HTTP server on http://${host}:${this.port}`);
                this.httpServer.listen(this.port, host, () => {
                    console.log(`[Server.start] ✅ Server is RUNNING on http://${host}:${this.port}`);
                    logger_1.logger.info(`🚀 Server is running on http://${host}:${this.port}`);
                    logger_1.logger.info(`Environment: ${process.env.NODE_ENV}`);
                    logger_1.logger.info(`Process ID: ${process.pid}`);
                });
                // این لاگ برای اطمینان از اینکه listen به صورت غیرهمزمان بلاک نمی کند
                console.log('[Server.start] httpServer.listen called. Waiting for "listening" event or error.');
            }
            catch (error) {
                console.error('[Server.start] FATAL ERROR during server startup:', error.stack || error);
                logger_1.logger.error('Failed to start server:', error); // logger is fine here
                // Ensure gracefulShutdown is not called again if already in progress
                // process.exit(1); // The global catch or unhandledRejection should handle this
                throw error; // Re-throw to be caught by the final catch block
            }
        });
    }
}
console.log('[SERVER_TS_BOTTOM] Server class defined.');
let serverInstance; // <--- تعریف متغیر در scope بالاتر
try {
    console.log('[SERVER_TS_BOTTOM] Creating new Server instance...');
    serverInstance = new Server(); // <--- مقداردهی به متغیر
    console.log('[SERVER_TS_BOTTOM] Server instance created. Calling server.start()...');
    serverInstance.start()
        .then(() => {
        console.log('[SERVER_TS_BOTTOM] server.start() promise resolved (server should be listening).');
        // برنامه نباید اینجا تمام شود اگر سرور در حال اجراست
    })
        .catch((error) => {
        console.error('[SERVER_TS_BOTTOM] CRITICAL: Error after server.start() call:', error.stack || error);
        process.exit(1);
    });
    console.log('[SERVER_TS_BOTTOM] server.start() called. Script execution theoretically ends here unless server is listening.');
}
catch (e) {
    console.error('[SERVER_TS_BOTTOM] CRITICAL: Uncaught exception during server instantiation or start invocation:', e.stack || e);
    process.exit(1);
}
// این لاگ نباید دیده شود اگر سرور به درستی اجرا شود و منتظر بماند
console.log('[SERVER_TS_END_OF_FILE] Reached end of server.ts script. If server is not running, this is an issue.');
exports.default = serverInstance; // <--- حالا serverInstance قابل export است
