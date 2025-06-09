// backend/src/config/socket.ts
// Socket.IO configuration and setup

import { Server as SocketServer } from 'socket.io';
import { logger } from '../utils/logger';
import { verifyJwt } from '../utils/jwt';

// Active connected users
const connectedUsers = new Map<string, string>();

/**
 * Setup Socket.IO server
 */
export const setupSocketIO = (io: SocketServer): void => {
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      
      const decoded = await verifyJwt(token);
      if (!decoded) {
        return next(new Error('Authentication error: Invalid token'));
      }
      
      // Set user data on socket
      socket.data.user = decoded;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    const userId = socket.data.user?.id;
    
    if (userId) {
      // Store connection
      connectedUsers.set(userId, socket.id);
      
      // Join user's room
      socket.join(`user:${userId}`);
      
      logger.info(`User connected: ${userId}, Socket ID: ${socket.id}`);
      
      // Notify other users that this user is online
      socket.broadcast.emit('user:status', { userId, status: 'online' });
      
      // Send connected users list to this user
      const onlineUsers = Array.from(connectedUsers.keys());
      socket.emit('users:online', onlineUsers);
    }

    // Handle joining conversation rooms
    socket.on('conversation:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      logger.info(`User ${userId} joined conversation: ${conversationId}`);
    });
    
    // Handle leaving conversation rooms
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      logger.info(`User ${userId} left conversation: ${conversationId}`);
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
        logger.info(`User disconnected: ${userId}`);
        
        // Notify other users that this user is offline
        io.emit('user:status', { userId, status: 'offline' });
      }
    });
  });
  
  // Cleanup interval to check for stale connections
  setInterval(() => {
    io.sockets.sockets.forEach(socket => {
      if (!socket.connected) {
        const userId = socket.data.user?.id;
        if (userId && connectedUsers.get(userId) === socket.id) {
          connectedUsers.delete(userId);
          logger.info(`Removed stale connection for user: ${userId}`);
          io.emit('user:status', { userId, status: 'offline' });
        }
      }
    });
  }, 60000); // Run every minute
};

/**
 * Get all online users
 */
export const getOnlineUsers = (): string[] => {
  return Array.from(connectedUsers.keys());
};

/**
 * Check if a user is online
 */
export const isUserOnline = (userId: string): boolean => {
  return connectedUsers.has(userId);
}; 