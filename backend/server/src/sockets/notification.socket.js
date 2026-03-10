import Notification from '../models/Notification.model.js';

/**
 * Handle notification socket events
 * @param {Socket} socket - Socket.io socket instance
 * @param {IO} io - Socket.io server instance
 */
export const handleNotificationSocket = (socket, io) => {
  // Join user's personal notification room
  socket.on('join_notifications', () => {
    socket.join(`user:${socket.userId}`);
    console.log(`User ${socket.userId} joined notification room`);
  });

  // Leave notification room
  socket.on('leave_notifications', () => {
    socket.leave(`user:${socket.userId}`);
    console.log(`User ${socket.userId} left notification room`);
  });

  // Get notifications
  socket.on('get_notifications', async (data, callback) => {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = data;
      const skip = (page - 1) * limit;

      const filter = { recipient: socket.userId, isDeleted: false };
      
      if (unreadOnly) {
        filter.isRead = false;
      }

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'name avatar');

      const total = await Notification.countDocuments(filter);
      const unreadCount = await Notification.getUnreadCount(socket.userId);

      if (callback) {
        callback({
          success: true,
          notifications,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          },
          unreadCount
        });
      }
    } catch (error) {
      console.error('Error getting notifications:', error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  // Mark notification as read
  socket.on('mark_notification_read', async (data, callback) => {
    try {
      const { notificationId } = data;

      const notification = await Notification.findOne({
        _id: notificationId,
        recipient: socket.userId
      });

      if (!notification) {
        if (callback) callback({ success: false, error: 'Notification not found' });
        return;
      }

      notification.markAsRead();
      await notification.save();

      // Get updated unread count
      const unreadCount = await Notification.getUnreadCount(socket.userId);

      if (callback) callback({ success: true, unreadCount });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  // Mark all notifications as read
  socket.on('mark_all_notifications_read', async (data, callback) => {
    try {
      await Notification.markAllAsRead(socket.userId);

      if (callback) callback({ success: true, unreadCount: 0 });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  // Delete notification
  socket.on('delete_notification', async (data, callback) => {
    try {
      const { notificationId } = data;

      const notification = await Notification.findOne({
        _id: notificationId,
        recipient: socket.userId
      });

      if (!notification) {
        if (callback) callback({ success: false, error: 'Notification not found' });
        return;
      }

      notification.isDeleted = true;
      await notification.save();

      // Get updated unread count
      const unreadCount = await Notification.getUnreadCount(socket.userId);

      if (callback) callback({ success: true, unreadCount });
    } catch (error) {
      console.error('Error deleting notification:', error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  // Get unread count
  socket.on('get_unread_count', async (data, callback) => {
    try {
      const unreadCount = await Notification.getUnreadCount(socket.userId);
      
      if (callback) callback({ success: true, unreadCount });
    } catch (error) {
      console.error('Error getting unread count:', error);
      if (callback) callback({ success: false, error: error.message });
    }
  });

  // Acknowledge notification received
  socket.on('notification_received', (data) => {
    const { notificationId } = data;
    console.log(`Notification ${notificationId} received by user ${socket.userId}`);
  });
};

/**
 * Emit notification to specific user
 * @param {IO} io - Socket.io server instance
 * @param {string} userId - User ID
 * @param {Object} notification - Notification data
 */
export const emitNotification = (io, userId, notification) => {
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
};

export default { handleNotificationSocket, emitNotification };

