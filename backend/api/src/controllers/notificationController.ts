import { Request, Response } from 'express';
import { NotificationModel } from '../models/Notification';
import { logError } from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const notifications = await NotificationModel.getUserNotifications(userId, limit, offset);
    
    res.json({ notifications });
  } catch (error) {
    logError(error as Error, { context: 'Get notifications', userId: req.user?.userId });
    throw new CustomError('Failed to get notifications', 500, 'GET_NOTIFICATIONS_ERROR');
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const count = await NotificationModel.getUnreadCount(userId);
    
    res.json({ count });
  } catch (error) {
    logError(error as Error, { context: 'Get unread count', userId: req.user?.userId });
    throw new CustomError('Failed to get unread count', 500, 'GET_UNREAD_COUNT_ERROR');
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { notificationId } = req.params;
    await NotificationModel.markAsRead(notificationId, userId);
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    const { notificationId } = req.params;
    logError(error as Error, { context: 'Mark notification as read', notificationId, userId: req.user?.userId });
    throw new CustomError('Failed to mark notification as read', 500, 'MARK_READ_ERROR');
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await NotificationModel.markAllAsRead(userId);
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    logError(error as Error, { context: 'Mark all notifications as read', userId: req.user?.userId });
    throw new CustomError('Failed to mark all notifications as read', 500, 'MARK_ALL_READ_ERROR');
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { notificationId } = req.params;
    await NotificationModel.delete(notificationId, userId);
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    const { notificationId } = req.params;
    logError(error as Error, { context: 'Delete notification', notificationId, userId: req.user?.userId });
    throw new CustomError('Failed to delete notification', 500, 'DELETE_NOTIFICATION_ERROR');
  }
};

