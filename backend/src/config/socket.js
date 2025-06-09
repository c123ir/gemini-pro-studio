"use strict";
// backend/src/config/socket.ts
// Socket.IO configuration and setup
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
exports.isUserOnline = exports.getOnlineUsers = exports.setupSocketIO = void 0;
const logger_1 = require("../utils/logger");
const jwt_1 = require("../utils/jwt");
// Active connected users
const connectedUsers = new Map();
/**
 * Setup Socket.IO server
 */
const setupSocketIO = (io) => {
    // Middleware for authentication
    io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const token = socket.handshake.auth.token || ((_a = socket.handshake.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1]);
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }
            const decoded = yield (0, jwt_1.verifyJwt)(token);
            if (!decoded) {
                return next(new Error('Authentication error: Invalid token'));
            }
            // Set user data on socket
            socket.data.user = decoded;
            next();
        }
        catch (error) {
            logger_1.logger.error('Socket authentication error:', error);
            next(new Error('Authentication error'));
        }
    }));
    // Connection event
    io.on('connection', (socket) => {
        var _a;
        const userId = (_a = socket.data.user) === null || _a === void 0 ? void 0 : _a.id;
        if (userId) {
            // Store connection
            connectedUsers.set(userId, socket.id);
            // Join user's room
            socket.join(`user:${userId}`);
            logger_1.logger.info(`User connected: ${userId}, Socket ID: ${socket.id}`);
            // Notify other users that this user is online
            socket.broadcast.emit('user:status', { userId, status: 'online' });
            // Send connected users list to this user
            const onlineUsers = Array.from(connectedUsers.keys());
            socket.emit('users:online', onlineUsers);
        }
        // Handle joining conversation rooms
        socket.on('conversation:join', (conversationId) => {
            socket.join(`conversation:${conversationId}`);
            logger_1.logger.info(`User ${userId} joined conversation: ${conversationId}`);
        });
        // Handle leaving conversation rooms
        socket.on('conversation:leave', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
            logger_1.logger.info(`User ${userId} left conversation: ${conversationId}`);
        });
        // Handle typing indicators
        socket.on('typing:start', (data) => {
            socket.to(`conversation:${data.conversationId}`).emit('typing:start', {
                conversationId: data.conversationId,
                userId
            });
        });
        socket.on('typing:stop', (data) => {
            socket.to(`conversation:${data.conversationId}`).emit('typing:stop', {
                conversationId: data.conversationId,
                userId
            });
        });
        // Handle user going offline
        socket.on('disconnect', () => {
            if (userId) {
                connectedUsers.delete(userId);
                logger_1.logger.info(`User disconnected: ${userId}`);
                // Notify other users that this user is offline
                io.emit('user:status', { userId, status: 'offline' });
            }
        });
    });
    // Cleanup interval to check for stale connections
    setInterval(() => {
        io.sockets.sockets.forEach(socket => {
            var _a;
            if (!socket.connected) {
                const userId = (_a = socket.data.user) === null || _a === void 0 ? void 0 : _a.id;
                if (userId && connectedUsers.get(userId) === socket.id) {
                    connectedUsers.delete(userId);
                    logger_1.logger.info(`Removed stale connection for user: ${userId}`);
                    io.emit('user:status', { userId, status: 'offline' });
                }
            }
        });
    }, 60000); // Run every minute
};
exports.setupSocketIO = setupSocketIO;
/**
 * Get all online users
 */
const getOnlineUsers = () => {
    return Array.from(connectedUsers.keys());
};
exports.getOnlineUsers = getOnlineUsers;
/**
 * Check if a user is online
 */
const isUserOnline = (userId) => {
    return connectedUsers.has(userId);
};
exports.isUserOnline = isUserOnline;
