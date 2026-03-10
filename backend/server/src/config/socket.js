import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from './env.js';
import User from '../models/User.model.js';
import { handleChatSocket } from '../sockets/chat.socket.js';
import { handleNotificationSocket } from '../sockets/notification.socket.js';

let io = null;
const onlineUsers = new Map(); // userId -> socketId

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      if (user.isBanned) {
        return next(new Error('Authentication error: User is banned'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Track online user
    onlineUsers.set(socket.userId, socket.id);
    
    // Join personal room for notifications
    socket.join(`user:${socket.userId}`);
    
    // Broadcast user online status
    socket.broadcast.emit('user_online', { userId: socket.userId });

    // Initialize chat socket handlers
    handleChatSocket(socket, io);

    // Initialize notification socket handlers
    handleNotificationSocket(socket, io);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      onlineUsers.delete(socket.userId);
      socket.broadcast.emit('user_offline', { userId: socket.userId });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const getOnlineUsers = () => {
  return onlineUsers;
};

export const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};

export const getSocketId = (userId) => {
  return onlineUsers.get(userId);
};

export default { initializeSocket, getIO, getOnlineUsers, isUserOnline, getSocketId };
