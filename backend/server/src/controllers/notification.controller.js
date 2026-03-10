import * as notificationService from '../services/notification.service.js';
import Notification from '../models/Notification.model.js';
import { formatSuccess, formatError } from '../utils/formatResponse.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { asyncHandler } from '../middleware/error.middleware.js';

/**
 * Get notifications
 * GET /api/notifications
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const result = await notificationService.getNotifications(userId, req.query);
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Notifications retrieved successfully',
      data: { notifications: result.notifications },
      pagination: result.pagination
    })
  );
});

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const count = await notificationService.getUnreadCount(userId);
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Unread count retrieved successfully',
      data: { count }
    })
  );
});

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  
  const notification = await notificationService.markAsRead(id, userId);
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Notification marked as read',
      data: { notification }
    })
  );
});

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.userId;
  
  await notificationService.markAllAsRead(userId);
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'All notifications marked as read',
      data: null
    })
  );
});

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  
  await notificationService.deleteNotification(id, userId);
  
  res.status(HTTP_STATUS.OK).json(
    formatSuccess({
      message: 'Notification deleted successfully',
      data: null
    })
  );
});

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
