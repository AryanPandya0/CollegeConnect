import Message from '../models/Message.model.js';
import User from '../models/User.model.js';
import * as notificationService from '../services/notification.service.js';
import { formatSuccess, formatError, getPaginationOptions, calculatePagination } from '../utils/formatResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { isUserOnline, getIO } from '../config/socket.js';

/**
 * Get user's conversations
 * GET /api/chat/conversations
 */
export const getConversations = asyncHandler(async (req, res) => {
  const userId = req.userId;
  
  const conversations = await Message.getConversations(userId);
  
  // Populate user details for each conversation
  const populatedConversations = await Promise.all(
    conversations.map(async (conv) => {
      const otherUser = await User.findById(conv._id).select('name avatar');
      return {
        user: otherUser,
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount
      };
    })
  );
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Conversations retrieved successfully',
      data: { conversations: populatedConversations }
    })
  );
});

/**
 * Get conversation messages
 * GET /api/chat/messages/:userId
 */
export const getMessages = asyncHandler(async (req, res) => {
  const { userId: otherUserId } = req.params;
  const currentUserId = req.userId;
  const { page, limit, skip } = getPaginationOptions(req.query);
  
  // Check if other user exists
  const otherUser = await User.findById(otherUserId);
  if (!otherUser) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'User not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  // Get messages
  const messages = await Message.getConversation(
    currentUserId,
    otherUserId,
    { limit, skip }
  );
  
  // Count total for pagination
  const total = await Message.countDocuments({
    $or: [
      { sender: currentUserId, receiver: otherUserId },
      { sender: otherUserId, receiver: currentUserId }
    ],
    isDeleted: false
  });
  
  // Mark unread messages as read
  await Message.updateMany(
    {
      sender: otherUserId,
      receiver: currentUserId,
      isRead: false
    },
    { isRead: true, readAt: new Date() }
  );
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Messages retrieved successfully',
      data: { messages },
      pagination: calculatePagination(total, page, limit)
    })
  );
});

/**
 * Send message (REST API fallback)
 * POST /api/chat/messages/:userId
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { userId: receiverId } = req.params;
  const senderId = req.userId;
  const { content } = req.body;
  
  // Check if receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'User not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  // Cannot message yourself
  if (senderId === receiverId) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json(
      formatError({
        message: 'Cannot send message to yourself',
        statusCode: HTTP_STATUS.BAD_REQUEST
      })
    );
  }
  
  // Create message
  const message = new Message({
    sender: senderId,
    receiver: receiverId,
    content
  });
  
  await message.save();
  
  await message.populate('sender', 'name avatar');
  await message.populate('receiver', 'name avatar');
  
  // Emit to receiver if online
  const io = getIO();
  io.to(`user:${receiverId}`).emit('new_message', {
    message: {
      id: message._id,
      sender: message.sender,
      content: message.content,
      createdAt: message.createdAt
    }
  });
  
  // Create notification
  await notificationService.createMessageNotification(
    receiverId,
    senderId,
    message._id
  );
  
  res.status(HTTP_STATUS.CREATED).json(
    formatSuccess({
      message: 'Message sent successfully',
      data: { message }
    })
  );
});

/**
 * Delete message
 * DELETE /api/chat/messages/:id
 */
export const deleteMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  
  const message = await Message.findById(id);
  
  if (!message) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Message not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  // Can only delete own messages
  if (message.sender.toString() !== userId) {
    return res.status(HTTP_STATUS.FORBIDDEN).json(
      formatError({
        message: 'Can only delete your own messages',
        statusCode: HTTP_STATUS.FORBIDDEN
      })
    );
  }
  
  message.softDelete(userId);
  await message.save();
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Message deleted successfully',
      data: null
    })
  );
});

/**
 * Mark message as read
 * PUT /api/chat/messages/:id/read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  
  const message = await Message.findOne({
    _id: id,
    receiver: userId
  });
  
  if (!message) {
    return res.status(HTTP_STATUS.NOT_FOUND).json(
      formatError({
        message: 'Message not found',
        statusCode: HTTP_STATUS.NOT_FOUND
      })
    );
  }
  
  message.markAsRead();
  await message.save();
  
  // Notify sender that message was read
  const io = getIO();
  io.to(`user:${message.sender}`).emit('message_read', {
    messageId: message._id,
    readAt: message.readAt
  });
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Message marked as read',
      data: { message }
    })
  );
});

/**
 * Get unread message count
 * GET /api/chat/unread-count
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.userId;
  
  const count = await Message.countDocuments({
    receiver: userId,
    isRead: false,
    isDeleted: false
  });
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Unread count retrieved successfully',
      data: { count }
    })
  );
});

export default {
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  markAsRead,
  getUnreadCount
};

