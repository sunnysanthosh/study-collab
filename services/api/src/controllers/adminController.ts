import { Request, Response } from 'express';
import { query } from '../db/connection';
import * as UserModel from '../models/User';
import * as TopicModel from '../models/Topic';
import * as AdminActivityLog from '../models/AdminActivityLog';
import { logError } from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const [usersResult, topicsResult, onlineResult, messagesResult] = await Promise.all([
      query('SELECT COUNT(*) AS count FROM users'),
      query('SELECT COUNT(*) AS count FROM topics'),
      query(`SELECT COUNT(*) AS count FROM user_sessions WHERE status = 'online'`),
      query('SELECT COUNT(*) AS count FROM messages'),
    ]);

    const totalUsers = parseInt(usersResult.rows[0].count as string, 10);
    const activeTopics = parseInt(topicsResult.rows[0].count as string, 10);
    const onlineNow = parseInt(onlineResult.rows[0].count as string, 10);
    const totalMessages = parseInt(messagesResult.rows[0].count as string, 10);

    res.json({
      stats: {
        totalUsers,
        activeTopics,
        pendingRequests: 0,
        onlineNow,
        totalMessages,
      },
    });
  } catch (error) {
    logError(error as Error, { context: 'Admin stats' });
    throw new CustomError('Failed to get admin stats', 500, 'ADMIN_STATS_ERROR');
  }
};

export const getAdminUsers = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 100);
    const offset = Math.max(parseInt(req.query.offset as string, 10) || 0, 0);

    const usersResult = await query(
      `SELECT id, name, email, role, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      users: usersResult.rows,
      limit,
      offset,
    });
  } catch (error) {
    logError(error as Error, { context: 'Admin users' });
    throw new CustomError('Failed to get users', 500, 'ADMIN_USERS_ERROR');
  }
};

export const updateAdminUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const target = await UserModel.getUserById(id);
    if (!target) return res.status(404).json({ error: 'User not found' });

    if (id === userId) {
      const { role } = req.body;
      if (role !== undefined && role !== target.role) {
        return res.status(400).json({ error: 'Cannot change your own role' });
      }
    }

    const { name, email, role } = req.body;
    const updates: UserModel.AdminUserUpdate = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof email === 'string' && email.trim()) updates.email = email.trim();
    if (role === 'user' || role === 'admin') updates.role = role;

    if (updates.email && updates.email !== target.email) {
      const existing = await UserModel.getUserByEmail(updates.email);
      if (existing && existing.id !== id) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updated = await UserModel.adminUpdateUser(id, updates);
    try {
      await AdminActivityLog.createAdminLog({
        adminUserId: userId,
        action: 'user_updated',
        targetType: 'user',
        targetId: id,
        metadata: { name: updated.name, email: updated.email, role: updated.role },
      });
    } catch (logErr) {
      logError(logErr as Error, { context: 'Admin activity log', action: 'user_updated' });
    }
    res.json({ user: updated });
  } catch (error) {
    logError(error as Error, { context: 'Admin update user' });
    throw new CustomError('Failed to update user', 500, 'ADMIN_UPDATE_USER_ERROR');
  }
};

export const deleteAdminUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    if (id === userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const target = await UserModel.getUserById(id);
    if (!target) return res.status(404).json({ error: 'User not found' });

    if (target.role === 'admin') {
      const adminCount = await UserModel.countUsersByRole('admin');
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin' });
      }
    }

    try {
      await AdminActivityLog.createAdminLog({
        adminUserId: userId,
        action: 'user_deleted',
        targetType: 'user',
        targetId: id,
        metadata: { email: target.email, name: target.name },
      });
    } catch (logErr) {
      logError(logErr as Error, { context: 'Admin activity log', action: 'user_deleted' });
    }
    await UserModel.deleteUser(id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    logError(error as Error, { context: 'Admin delete user' });
    throw new CustomError('Failed to delete user', 500, 'ADMIN_DELETE_USER_ERROR');
  }
};

export const getAdminTopics = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 100);
    const offset = Math.max(parseInt(req.query.offset as string, 10) || 0, 0);

    const topics = await TopicModel.getAdminTopicList(limit, offset);
    res.json({ topics, limit, offset });
  } catch (error) {
    logError(error as Error, { context: 'Admin topics' });
    throw new CustomError('Failed to get topics', 500, 'ADMIN_TOPICS_ERROR');
  }
};

export const deleteAdminTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const topic = await TopicModel.getTopicById(id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    try {
      await AdminActivityLog.createAdminLog({
        adminUserId: userId,
        action: 'topic_deleted',
        targetType: 'topic',
        targetId: id,
        metadata: { title: topic.title },
      });
    } catch (logErr) {
      logError(logErr as Error, { context: 'Admin activity log', action: 'topic_deleted' });
    }
    await TopicModel.deleteTopic(id);
    res.json({ message: 'Topic deleted' });
  } catch (error) {
    logError(error as Error, { context: 'Admin delete topic' });
    throw new CustomError('Failed to delete topic', 500, 'ADMIN_DELETE_TOPIC_ERROR');
  }
};

export const getAdminActivityLogs = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 100);
    const offset = Math.max(parseInt(req.query.offset as string, 10) || 0, 0);

    const logs = await AdminActivityLog.getAdminActivityLogs(limit, offset);
    res.json({ logs, limit, offset });
  } catch (error) {
    logError(error as Error, { context: 'Admin activity logs' });
    throw new CustomError('Failed to get activity logs', 500, 'ADMIN_ACTIVITY_LOGS_ERROR');
  }
};
