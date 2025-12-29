"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getUnreadCount = exports.getNotifications = void 0;
const Notification_1 = require("../models/Notification");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const getNotifications = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const notifications = await Notification_1.NotificationModel.getUserNotifications(userId, limit, offset);
        res.json({ notifications });
    }
    catch (error) {
        (0, logger_1.logError)(error, { context: 'Get notifications', userId: req.user?.userId });
        throw new errorHandler_1.CustomError('Failed to get notifications', 500, 'GET_NOTIFICATIONS_ERROR');
    }
};
exports.getNotifications = getNotifications;
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const count = await Notification_1.NotificationModel.getUnreadCount(userId);
        res.json({ count });
    }
    catch (error) {
        (0, logger_1.logError)(error, { context: 'Get unread count', userId: req.user?.userId });
        throw new errorHandler_1.CustomError('Failed to get unread count', 500, 'GET_UNREAD_COUNT_ERROR');
    }
};
exports.getUnreadCount = getUnreadCount;
const markAsRead = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const { notificationId } = req.params;
        await Notification_1.NotificationModel.markAsRead(notificationId, userId);
        res.json({ message: 'Notification marked as read' });
    }
    catch (error) {
        const { notificationId } = req.params;
        (0, logger_1.logError)(error, { context: 'Mark notification as read', notificationId, userId: req.user?.userId });
        throw new errorHandler_1.CustomError('Failed to mark notification as read', 500, 'MARK_READ_ERROR');
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        await Notification_1.NotificationModel.markAllAsRead(userId);
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        (0, logger_1.logError)(error, { context: 'Mark all notifications as read', userId: req.user?.userId });
        throw new errorHandler_1.CustomError('Failed to mark all notifications as read', 500, 'MARK_ALL_READ_ERROR');
    }
};
exports.markAllAsRead = markAllAsRead;
const deleteNotification = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const { notificationId } = req.params;
        await Notification_1.NotificationModel.delete(notificationId, userId);
        res.json({ message: 'Notification deleted' });
    }
    catch (error) {
        const { notificationId } = req.params;
        (0, logger_1.logError)(error, { context: 'Delete notification', notificationId, userId: req.user?.userId });
        throw new errorHandler_1.CustomError('Failed to delete notification', 500, 'DELETE_NOTIFICATION_ERROR');
    }
};
exports.deleteNotification = deleteNotification;
