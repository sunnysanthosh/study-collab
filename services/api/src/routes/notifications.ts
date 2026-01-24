import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as NotificationController from '../controllers/notificationController';

export const notificationRoutes = Router();

// All notification routes require authentication
notificationRoutes.use(authenticate);

notificationRoutes.get('/', NotificationController.getNotifications);
notificationRoutes.get('/unread-count', NotificationController.getUnreadCount);
notificationRoutes.put('/:notificationId/read', NotificationController.markAsRead);
notificationRoutes.put('/read-all', NotificationController.markAllAsRead);
notificationRoutes.delete('/:notificationId', NotificationController.deleteNotification);

