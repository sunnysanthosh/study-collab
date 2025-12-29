"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const connection_1 = __importDefault(require("../db/connection"));
exports.NotificationModel = {
    async create(data) {
        const result = await connection_1.default.query(`INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [data.user_id, data.type, data.title, data.message || null, data.link || null]);
        return result.rows[0];
    },
    async getUserNotifications(userId, limit = 50, offset = 0) {
        const result = await connection_1.default.query(`SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`, [userId, limit, offset]);
        return result.rows;
    },
    async getUnreadCount(userId) {
        const result = await connection_1.default.query(`SELECT COUNT(*) as count FROM notifications
       WHERE user_id = $1 AND read = FALSE`, [userId]);
        return parseInt(result.rows[0].count);
    },
    async markAsRead(notificationId, userId) {
        await connection_1.default.query(`UPDATE notifications
       SET read = TRUE
       WHERE id = $1 AND user_id = $2`, [notificationId, userId]);
    },
    async markAllAsRead(userId) {
        await connection_1.default.query(`UPDATE notifications
       SET read = TRUE
       WHERE user_id = $1 AND read = FALSE`, [userId]);
    },
    async delete(notificationId, userId) {
        await connection_1.default.query(`DELETE FROM notifications
       WHERE id = $1 AND user_id = $2`, [notificationId, userId]);
    },
};
