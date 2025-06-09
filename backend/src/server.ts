// backend/src/server.ts
// Main Server Entry Point
// Path: backend/src/server.ts

console.log('[SERVER_TS_TOP] Script execution started.'); // <--- لاگ اولیه

import dotenv from 'dotenv';
// Load environment variables VERY FIRST
dotenv.config();
console.log('[SERVER_TS_TOP] dotenv.config() called.'); // <--- لاگ

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import path from 'path';

console.log('[SERVER_TS_TOP] Basic imports loaded.'); // <--- لاگ

// Import configurations and utilities
// بگذارید logger دیرتر import شود تا مطمئن شویم console.log های اولیه کار می‌کنند
// import { logger } from './utils/logger'; 
console.log('[SERVER_TS_IMPORT_ATTEMPT] Attempting to import ./config/database...');

try {
  // اضافه کردن try-catch برای گرفتن خطاهای احتمالی
  var { connectDatabase } = require('./config/db_config');
console.log('[SERVER_TS_IMPORT_SUCCESS] Successfully imported ./config/database.');
} catch (error) {
  console.error('[SERVER_TS_IMPORT_ERROR] Error importing ./config/db_config:', error);
  process.exit(1); // خروج با خطا
}

console.log('[SERVER_TS_IMPORT_ATTEMPT] Attempting to import ./config/redis...');
try {
  var { setupRedis } = require('./config/redis');
console.log('[SERVER_TS_IMPORT_SUCCESS] Successfully imported ./config/redis.');
} catch (error) {
  console.error('[SERVER_TS_IMPORT_ERROR] Error importing ./config/redis:', error);
  // ادامه می‌دهیم چون redis اختیاری است
}

console.log('[SERVER_TS_IMPORT_ATTEMPT] Attempting to import ./middleware/rateLimiter...');
try {
  var { rateLimiter } = require('./middleware/rateLimiter');
console.log('[SERVER_TS_IMPORT_SUCCESS] Successfully imported ./middleware/rateLimiter.');
} catch (error) {
  console.error('[SERVER_TS_IMPORT_ERROR] Error importing ./middleware/rateLimiter:', error);
  process.exit(1);
}

console.log('[SERVER_TS_IMPORT_ATTEMPT] Attempting to import ./config/socket...');
try {
  var { setupSocketIO } = require('./config/socket');
console.log('[SERVER_TS_IMPORT_SUCCESS] Successfully imported ./config/socket.');
} catch (error) {
  console.error('[SERVER_TS_IMPORT_ERROR] Error importing ./config/socket:', error);
  process.exit(1);
}

console.log('[SERVER_TS_IMPORT_ATTEMPT] Attempting to import ./middleware/notFound...');
try {
  var { notFound } = require('./middleware/notFound');
console.log('[SERVER_TS_IMPORT_SUCCESS] Successfully imported ./middleware/notFound.');
} catch (error) {
  console.error('[SERVER_TS_IMPORT_ERROR] Error importing ./middleware/notFound:', error);
  process.exit(1);
}

console.log('[SERVER_TS_IMPORT_ATTEMPT] Attempting to import ./middleware/errorHandler...');
try {
  var { errorHandler } = require('./middleware/errorHandler');
console.log('[SERVER_TS_IMPORT_SUCCESS] Successfully imported ./middleware/errorHandler.');
} catch (error) {
  console.error('[SERVER_TS_IMPORT_ERROR] Error importing ./middleware/errorHandler:', error);
  process.exit(1);
}

console.log('[SERVER_TS_TOP] Config and util imports loaded (except logger).'); // <--- لاگ

// Import routes
try {
  // مسیرها را در یک بلاک try-catch import می‌کنیم
  console.log('[SERVER_TS_IMPORT_ATTEMPT] Attempting to import routes...');
  var authRoutes = require('./routes/auth').default;
  var userRoutes = require('./routes/users').default;
  var conversationRoutes = require('./routes/conversations').default;
  var messageRoutes = require('./routes/messages').default;
  var fileRoutes = require('./routes/files').default;
  var aiRoutes = require('./routes/ai').default;
  var tagRoutes = require('./routes/tags').default;
  var templateRoutes = require('./routes/templates').default;
  var statsRoutes = require('./routes/stats').default;
  var settingsRoutes = require('./routes/settings').default;
  var healthRoutes = require('./routes/health').default;
  console.log('[SERVER_TS_IMPORT_SUCCESS] Successfully imported all routes.');
} catch (error) {
  console.error('[SERVER_TS_IMPORT_ERROR] Error importing routes:', error);
  process.exit(1);
}

console.log('[SERVER_TS_TOP] Route imports loaded.'); // <--- لاگ

// Types
import type { Application } from 'express';

// حالا logger را import می کنیم
console.log('[SERVER_TS_IMPORT_ATTEMPT] Attempting to import ./utils/logger...');
try {
  var { logger } = require('./utils/logger');
  console.log('[SERVER_TS_IMPORT_SUCCESS] Successfully imported ./utils/logger.');
} catch (error) {
  console.error('[SERVER_TS_IMPORT_ERROR] Error importing ./utils/logger:', error);
  process.exit(1);
}
console.log('[SERVER_TS_TOP] Logger imported.'); // <--- لاگ


class Server {
    private app: Application;
    private httpServer: any;
    private io: SocketServer;
    private port: number;

    constructor() {
        console.log('[Server.constructor] Initializing server...');
        this.app = express();
        this.port = parseInt(process.env.PORT || '5150');
        console.log(`[Server.constructor] Port set to: ${this.port}`);
        this.httpServer = createServer(this.app);
        this.io = new SocketServer(this.httpServer, {
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

    private initializeMiddlewares(): void {
        console.log('[Server.initializeMiddlewares] Initializing middlewares...');
        // Security middleware
        if (process.env.HELMET_ENABLED === 'true') {
            this.app.use(helmet({
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
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3150'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        }));
        console.log('[Server.initializeMiddlewares] CORS configured.');

        // Compression
        this.app.use(compression());
        console.log('[Server.initializeMiddlewares] Compression enabled.');

        // Request logging
        if (process.env.NODE_ENV === 'development') {
            this.app.use(morgan('dev'));
            console.log('[Server.initializeMiddlewares] Morgan (dev) enabled.');
        } else {
            this.app.use(morgan('combined', {
                stream: {
                    write: (message: string) => logger.info(message.trim())
                }
            }));
            console.log('[Server.initializeMiddlewares] Morgan (combined) enabled.');
        }

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        console.log('[Server.initializeMiddlewares] Body parsing configured.');

        // Rate limiting
        this.app.use(rateLimiter.general);
        console.log('[Server.initializeMiddlewares] Rate limiting configured.');

        // Static files
        this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
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

    private initializeRoutes(): void {
        console.log('[Server.initializeRoutes] Initializing routes...');
        const apiPrefix = process.env.API_PREFIX || '/api';
        console.log(`[Server.initializeRoutes] API Prefix: ${apiPrefix}`);

        this.app.use(`${apiPrefix}/health`, healthRoutes); // Health route with prefix
        this.app.use(`${apiPrefix}/auth`, authRoutes);
        this.app.use(`${apiPrefix}/users`, userRoutes);
        this.app.use(`${apiPrefix}/conversations`, conversationRoutes);
        this.app.use(`${apiPrefix}/messages`, messageRoutes);
        this.app.use(`${apiPrefix}/files`, fileRoutes);
        this.app.use(`${apiPrefix}/ai`, aiRoutes);
        this.app.use(`${apiPrefix}/tags`, tagRoutes);
        this.app.use(`${apiPrefix}/templates`, templateRoutes);
        this.app.use(`${apiPrefix}/stats`, statsRoutes);
        this.app.use(`${apiPrefix}/settings`, settingsRoutes);
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

    private initializeErrorHandling(): void {
        console.log('[Server.initializeErrorHandling] Initializing error handling...');
        // 404 handler
        this.app.use(notFound);

        // Global error handler
        this.app.use(errorHandler);
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
        process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
            console.error('[PROCESS_EVENT] Unhandled Rejection at:', { promise, reason: reason?.stack || reason });
            logger.error('Unhandled Rejection at:', { promise, reason }); // Keep logger here too
            this.gracefulShutdown('unhandledRejection');
        });
        console.log('[Server.initializeErrorHandling] unhandledRejection handler configured.');

        // Uncaught exceptions
        process.on('uncaughtException', (error: Error) => {
            console.error('[PROCESS_EVENT] Uncaught Exception:', error.stack || error);
            logger.error('Uncaught Exception:', error); // Keep logger here too
            this.gracefulShutdown('uncaughtException');
        });
        console.log('[Server.initializeErrorHandling] uncaughtException handler configured.');
        console.log('[Server.initializeErrorHandling] Error handling initialized.');
    }

    private initializeSocket(): void {
        console.log('[Server.initializeSocket] Initializing Socket.IO...');
        setupSocketIO(this.io);
        this.app.set('io', this.io); // Make io available globally
        console.log('[Server.initializeSocket] Socket.IO initialized and set on app.');
    }

    private setupSwagger(): void {
        console.log('[Server.setupSwagger] Setting up Swagger...');
        try {
            const swaggerUi = require('swagger-ui-express');
            const swaggerDocument = require('../docs/swagger.json');
            
            this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
            logger.info('Swagger documentation available at /api-docs'); // logger is fine here
            console.log('[Server.setupSwagger] Swagger UI configured at /api-docs.');
        } catch (error) {
            console.error('[Server.setupSwagger] Swagger setup failed:', error);
            logger.warn('Swagger setup failed:', error); // logger is fine here
        }
    }

    private async gracefulShutdown(signal?: string): Promise<void> {
        console.log(`[Server.gracefulShutdown] Starting graceful shutdown due to ${signal || 'unknown reason'}...`);
        logger.info(`Starting graceful shutdown due to ${signal || 'unknown reason'}...`);

        // این بخش را کمی تغییر می دهیم تا مطمئن شویم لاگ ها قبل از خروج ثبت می شوند
        this.httpServer.close((err?: Error) => {
            if (err) {
                console.error('[Server.gracefulShutdown] Error closing HTTP server:', err);
                logger.error('Error closing HTTP server:', err);
            } else {
                console.log('[Server.gracefulShutdown] HTTP server closed.');
                logger.info('HTTP server closed');
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
            logger.error('Could not close connections in time, forcefully shutting down');
            process.exit(1);
        }, 10000).unref(); // .unref() allows the program to exit if this is the only timer left.
    }

    public async start(): Promise<void> {
        console.log('[Server.start] Attempting to start server...');
        try {
            // Initialize database
            console.log('[Server.start] Connecting to database...');
            await connectDatabase();
            console.log('[Server.start] Database connected successfully (or connection initiated).'); 
            logger.info('Database connected successfully'); // logger is fine here

            // Initialize Redis (optional)
            if (process.env.REDIS_URL) {
                console.log('[Server.start] Connecting to Redis...');
// ... (rest of the code remains the same)
                console.log('[Server.start] Redis connected successfully.');
                logger.info('Redis connected successfully'); // logger is fine here
            }

            // Start server
            const host = process.env.HOST || 'localhost';
            console.log(`[Server.start] Starting HTTP server on http://${host}:${this.port}`);
            
            this.httpServer.listen(this.port, host, () => {
                console.log(`[Server.start] ✅ Server is RUNNING on http://${host}:${this.port}`);
                logger.info(`🚀 Server is running on http://${host}:${this.port}`);
                logger.info(`Environment: ${process.env.NODE_ENV}`);
                logger.info(`Process ID: ${process.pid}`);
            });

            // این لاگ برای اطمینان از اینکه listen به صورت غیرهمزمان بلاک نمی کند
            console.log('[Server.start] httpServer.listen called. Waiting for "listening" event or error.');

        } catch (error: any) {
            console.error('[Server.start] FATAL ERROR during server startup:', error.stack || error);
            logger.error('Failed to start server:', error); // logger is fine here
            // Ensure gracefulShutdown is not called again if already in progress
            // process.exit(1); // The global catch or unhandledRejection should handle this
            throw error; // Re-throw to be caught by the final catch block
        }
    }
}

console.log('[SERVER_TS_BOTTOM] Server class defined.');

let serverInstance: Server; // <--- تعریف متغیر در scope بالاتر

try {
    console.log('[SERVER_TS_BOTTOM] Creating new Server instance...');
    serverInstance = new Server(); // <--- مقداردهی به متغیر
    console.log('[SERVER_TS_BOTTOM] Server instance created. Calling server.start()...');
    
    // برای جلوگیری از خروج زودهنگام، یک تایمر اضافه می‌کنیم
    setTimeout(() => {
        console.log('[SERVER_TS_DELAYED_START] Starting server with delay...');
    serverInstance.start()
        .then(() => {
            console.log('[SERVER_TS_BOTTOM] server.start() promise resolved (server should be listening).');
            // برنامه نباید اینجا تمام شود اگر سرور در حال اجراست
        })
        .catch((error) => {
            console.error('[SERVER_TS_BOTTOM] CRITICAL: Error after server.start() call:', error.stack || error);
            process.exit(1);
        });
    }, 1000);
    
    console.log('[SERVER_TS_BOTTOM] server.start() scheduled with delay. Script execution theoretically ends here unless server is listening.');
} catch (e: any) {
    console.error('[SERVER_TS_BOTTOM] CRITICAL: Uncaught exception during server instantiation or start invocation:', e.stack || e);
    process.exit(1);
}

// این لاگ نباید دیده شود اگر سرور به درستی اجرا شود و منتظر بماند
console.log('[SERVER_TS_END_OF_FILE] Reached end of server.ts script. If server is not running, this is an issue.');

// برای جلوگیری از پایان اسکریپت، یک تایمر طولانی تعریف می‌کنیم
setInterval(() => {
    console.log('[SERVER_TS_KEEPALIVE] Server keep-alive check...');
}, 60000);

export default serverInstance; // <--- حالا serverInstance قابل export است