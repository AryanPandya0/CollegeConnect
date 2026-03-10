import express from 'express';
import * as chatController from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { messageLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Conversations
router.get('/conversations', chatController.getConversations);
router.get('/unread-count', chatController.getUnreadCount);

// Messages
router.get('/messages/:userId', chatController.getMessages);
router.post('/messages/:userId', messageLimiter, chatController.sendMessage);
router.put('/messages/:id/read', chatController.markAsRead);
router.delete('/messages/:id', chatController.deleteMessage);

export default router;
