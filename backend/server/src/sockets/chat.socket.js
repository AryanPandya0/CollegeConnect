import Message from '../models/Message.model.js';
import User from '../models/User.model.js';
import * as notificationService from '../services/notification.service.js';
import { isUserOnline, getSocketId } from '../config/socket.js';

/**
 * Handle chat socket events
 * @param {Socket} socket - Socket.io socket instance
 * @param {IO} io - Socket.io server instance
 */
export const handleChatSocket = (socket, io) => {
  // Join conversation room
  socket.on('join_conversation', (data) => {
    const { userId } = data;
    const roomName = getConversationRoom(socket.userId, userId);
    socket.join(roomName);
    console.log(`User ${socket.userId} joined conversation room: ${roomName}`);
  });

  // Leave conversation room
  socket.on('leave_conversation', (data) => {
    const { userId } = data;
    const roomName = getConversationRoom(socket.userId, userId);
    socket.leave(roomName);
    console.log(`User ${socket.userId} left conversation room: ${roomName}`);
  });

  // Send message
  socket.on('send_message', async (data, callback) => {
    try {
      const { receiverId, content, replyTo } = data;

      // Validate receiver exists
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        if (callback) callback({ success: false, error: 'User not found' });
        return;
      }

      // Cannot message yourself
      if (socket.userId === receiverId) {
        if (callback) callback({ success: false, error: 'Cannot message yourself' });
        return;
      }

      // Create message
      const message = new Message({
        sender: socket.userId,
        receiver: receiverId,
        content,
        replyTo: replyTo || null
      });

      await message.save();

      // Populate sender info
      await message.populate('sender', 'name avatar');

      const messageData = {
        id: message._id,
        sender: message.sender,
        content: message.content,
        createdAt: message.createdAt,
        replyTo: message.replyTo
      };

      // Emit to conversation room
      const roomName = getConversationRoom(socket.userId, receiverId);
      io.to(roomName).emit('new_message', { message: messageData });

      // If receiver is online but not in the room, emit to their personal room
      if (isUserOnline(receiverId)) {
        io.to(`user:${receiverId}`).emit('new_message_notification', {
          message: messageData,
          sender: message.sender
        });
      }

      // Create notification
      await notificationService.createMessageNotification(
        receiverId,
        socket.userId,
        message._id
      );

      if (callback) callback({ success: true, message: messageData });
    } catch (error) {
      console.error('Error sending message:', error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    const { receiverId, isTyping } = data;
    const roomName = getConversationRoom(socket.userId, receiverId);
    
    socket.to(roomName).emit('typing', {
      userId: socket.userId,
      isTyping
    });
  });

  // Mark message as read
  socket.on('mark_read', async (data, callback) => {
    try {
      const { messageId } = data;

      const message = await Message.findOne({
        _id: messageId,
        receiver: socket.userId
      });

      if (!message) {
        if (callback) callback({ success: false, error: 'Message not found' });
        return;
      }

      message.markAsRead();
      await message.save();

      // Notify sender that message was read
      io.to(`user:${message.sender}`).emit('message_read', {
        messageId: message._id,
        readAt: message.readAt
      });

      if (callback) callback({ success: true });
    } catch (error) {
      console.error('Error marking message as read:', error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  // Mark all messages in conversation as read
  socket.on('mark_all_read', async (data, callback) => {
    try {
      const { senderId } = data;

      await Message.updateMany(
        {
          sender: senderId,
          receiver: socket.userId,
          isRead: false
        },
        { isRead: true, readAt: new Date() }
      );

      // Notify sender
      io.to(`user:${senderId}`).emit('all_messages_read', {
        by: socket.userId
      });

      if (callback) callback({ success: true });
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  // Delete message
  socket.on('delete_message', async (data, callback) => {
    try {
      const { messageId } = data;

      const message = await Message.findById(messageId);

      if (!message) {
        if (callback) callback({ success: false, error: 'Message not found' });
        return;
      }

      // Can only delete own messages
      if (message.sender.toString() !== socket.userId) {
        if (callback) callback({ success: false, error: 'Can only delete your own messages' });
        return;
      }

      message.softDelete(socket.userId);
      await message.save();

      // Notify conversation room
      const roomName = getConversationRoom(socket.userId, message.receiver);
      io.to(roomName).emit('message_deleted', { messageId });

      if (callback) callback({ success: true });
    } catch (error) {
      console.error('Error deleting message:', error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  // Get conversation messages
  socket.on('get_messages', async (data, callback) => {
    try {
      const { userId, page = 1, limit = 20 } = data;
      const skip = (page - 1) * limit;

      const messages = await Message.getConversation(
        socket.userId,
        userId,
        { limit, skip }
      );

      if (callback) callback({ success: true, messages });
    } catch (error) {
      console.error('Error getting messages:', error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  // Get conversations list
  socket.on('get_conversations', async (data, callback) => {
    try {
      const conversations = await Message.getConversations(socket.userId);

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

      if (callback) callback({ success: true, conversations: populatedConversations });
    } catch (error) {
      console.error('Error getting conversations:', error);
      if (callback) callback({ success: false, error: error.message });
    }
  });
};

/**
 * Generate consistent conversation room name
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {string} Room name
 */
const getConversationRoom = (userId1, userId2) => {
  // Sort IDs to ensure consistent room name regardless of order
  const sortedIds = [userId1, userId2].sort();
  return `conversation:${sortedIds[0]}:${sortedIds[1]}`;
};

export default { handleChatSocket };
