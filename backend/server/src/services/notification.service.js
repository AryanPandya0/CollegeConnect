import Notification from '../models/Notification.model.js';
import { getIO, isUserOnline, getSocketId } from '../config/socket.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';
import { getPaginationOptions, calculatePagination } from '../utils/formatResponse.js';

/**
 * Create and send notification
 * @param {Object} data - Notification data
 * @returns {Object} Created notification
 */
export const createNotification = async (data) => {
  const { recipient, sender, type, title, message, targetId, targetType } = data;

  // Don't notify if sender is the same as recipient
  if (sender && sender.toString() === recipient.toString()) {
    return null;
  }

  const notification = await Notification.createNotification({
    recipient,
    sender,
    type,
    title,
    message,
    targetId,
    targetType
  });

  // Emit to recipient if online
  await emitNotification(recipient, notification);

  return notification;
};

/**
 * Emit notification via Socket.io
 * @param {string} userId - Recipient user ID
 * @param {Object} notification - Notification object
 */
export const emitNotification = async (userId, notification) => {
  try {
    const io = getIO();
    
    // Emit to user's personal room
    io.to(`user:${userId}`).emit('new_notification', {
      notification: {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        targetId: notification.targetId,
        targetType: notification.targetType,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        sender: notification.sender
      }
    });
  } catch (error) {
    console.error('Error emitting notification:', error);
  }
};

/**
 * Get user's notifications
 * @param {string} userId - User ID
 * @param {Object} query - Query parameters
 * @returns {Object} Notifications and pagination
 */
export const getNotifications = async (userId, query) => {
  const { page, limit, skip } = getPaginationOptions(query);
  const { unreadOnly = false } = query;

  const filter = { recipient: userId, isDeleted: false };
  
  if (unreadOnly === 'true') {
    filter.isRead = false;
  }

  const total = await Notification.countDocuments(filter);

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name avatar');

  return {
    notifications,
    pagination: calculatePagination(total, page, limit)
  };
};

/**
 * Get unread notification count
 * @param {string} userId - User ID
 * @returns {number} Unread count
 */
export const getUnreadCount = async (userId) => {
  return await Notification.getUnreadCount(userId);
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID (for verification)
 * @returns {Object} Updated notification
 */
export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  notification.markAsRead();
  await notification.save();

  return notification;
};

/**
 * Mark all notifications as read
 * @param {string} userId - User ID
 */
export const markAllAsRead = async (userId) => {
  await Notification.markAllAsRead(userId);
};

/**
 * Delete notification
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID
 */
export const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  notification.isDeleted = true;
  await notification.save();
};

/**
 * Create reply notification
 * @param {string} postAuthorId - Post author ID
 * @param {string} replierId - User who replied
 * @param {string} postId - Post ID
 * @param {string} commentId - Comment ID
 */
export const createReplyNotification = async (postAuthorId, replierId, postId, commentId) => {
  return createNotification({
    recipient: postAuthorId,
    sender: replierId,
    type: NOTIFICATION_TYPES.REPLY,
    title: 'New Reply',
    message: 'Someone replied to your post',
    targetId: commentId,
    targetType: 'comment'
  });
};

/**
 * Create mention notification
 * @param {string} mentionedUserId - Mentioned user ID
 * @param {string} mentionerId - User who mentioned
 * @param {string} targetId - Target ID (post or comment)
 * @param {string} targetType - Target type
 */
export const createMentionNotification = async (mentionedUserId, mentionerId, targetId, targetType) => {
  return createNotification({
    recipient: mentionedUserId,
    sender: mentionerId,
    type: NOTIFICATION_TYPES.MENTION,
    title: 'New Mention',
    message: `Someone mentioned you in a ${targetType}`,
    targetId,
    targetType
  });
};

/**
 * Create upvote notification
 * @param {string} contentAuthorId - Content author ID
 * @param {string} voterId - User who upvoted
 * @param {string} targetId - Target ID
 * @param {string} targetType - Target type ('post' or 'comment')
 */
export const createUpvoteNotification = async (contentAuthorId, voterId, targetId, targetType) => {
  return createNotification({
    recipient: contentAuthorId,
    sender: voterId,
    type: NOTIFICATION_TYPES.UPVOTE,
    title: 'New Upvote',
    message: `Someone upvoted your ${targetType}`,
    targetId,
    targetType
  });
};

/**
 * Create message notification
 * @param {string} receiverId - Message receiver ID
 * @param {string} senderId - Message sender ID
 * @param {string} messageId - Message ID
 */
export const createMessageNotification = async (receiverId, senderId, messageId) => {
  return createNotification({
    recipient: receiverId,
    sender: senderId,
    type: NOTIFICATION_TYPES.MESSAGE,
    title: 'New Message',
    message: 'You have a new message',
    targetId: messageId,
    targetType: 'message'
  });
};

/**
 * Create follow notification
 * @param {string} followedUserId - User who was followed
 * @param {string} followerId - User who followed
 */
export const createFollowNotification = async (followedUserId, followerId) => {
  return createNotification({
    recipient: followedUserId,
    sender: followerId,
    type: NOTIFICATION_TYPES.FOLLOW,
    title: 'New Follower',
    message: 'Someone started following you',
    targetId: followerId,
    targetType: 'user'
  });
};

export default {
  createNotification,
  emitNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createReplyNotification,
  createMentionNotification,
  createUpvoteNotification,
  createMessageNotification,
  createFollowNotification
};

