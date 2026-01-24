import pool from '../db/connection';

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'topic_invite' | 'reaction' | 'system';
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  created_at: Date;
}

export interface CreateNotificationData {
  user_id: string;
  type: 'message' | 'topic_invite' | 'reaction' | 'system';
  title: string;
  message?: string;
  link?: string;
}

export const NotificationModel = {
  async create(data: CreateNotificationData): Promise<Notification> {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.user_id, data.type, data.title, data.message || null, data.link || null]
    );
    const notification = result.rows[0];

    try {
      await pool.query('NOTIFY notification_created, $1', [
        JSON.stringify({ userId: notification.user_id, notification }),
      ]);
    } catch {
      // Notification delivery is best-effort
    }

    return notification;
  },

  async getUserNotifications(userId: string, limit: number = 50, offset: number = 0): Promise<Notification[]> {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  },

  async getUnreadCount(userId: string): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM notifications
       WHERE user_id = $1 AND read = FALSE`,
      [userId]
    );
    return parseInt(result.rows[0].count);
  },

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await pool.query(
      `UPDATE notifications
       SET read = TRUE
       WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    );
  },

  async markAllAsRead(userId: string): Promise<void> {
    await pool.query(
      `UPDATE notifications
       SET read = TRUE
       WHERE user_id = $1 AND read = FALSE`,
      [userId]
    );
  },

  async delete(notificationId: string, userId: string): Promise<void> {
    await pool.query(
      `DELETE FROM notifications
       WHERE id = $1 AND user_id = $2`,
      [notificationId, userId]
    );
  },
};

