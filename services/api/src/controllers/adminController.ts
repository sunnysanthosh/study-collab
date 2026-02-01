import { Request, Response } from 'express';
import { query } from '../db/connection';
import * as UserModel from '../models/User';
import * as TopicModel from '../models/Topic';
import * as AdminActivityLog from '../models/AdminActivityLog';
import * as ContentReportModel from '../models/ContentReport';
import * as MessageModel from '../models/Message';
import { logError } from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';
import { getCache, setCache, invalidateCache } from '../utils/redis';

export const createAdminUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const { name, email, password, role } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!email || !email.trim()) return res.status(400).json({ error: 'Email is required' });
    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await UserModel.getUserByEmail(email.trim());
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const created = await UserModel.adminCreateUser({
      name: name.trim(),
      email: email.trim(),
      password,
      role: role === 'admin' ? 'admin' : 'user',
    });

    try {
      await AdminActivityLog.createAdminLog({
        adminUserId: userId,
        action: 'user_created',
        targetType: 'user',
        targetId: created.id,
        metadata: { name: created.name, email: created.email, role: created.role },
      });
    } catch (logErr) {
      logError(logErr as Error, { context: 'Admin activity log', action: 'user_created' });
    }

    await invalidateCache('admin:*');
    res.status(201).json({ user: created });
  } catch (error) {
    logError(error as Error, { context: 'Admin create user' });
    throw new CustomError('Failed to create user', 500, 'ADMIN_CREATE_USER_ERROR');
  }
};

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const cached = await getCache<{ stats: Record<string, number> }>('admin:stats');
    if (cached) return res.json(cached);

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

    const payload = {
      stats: {
        totalUsers,
        activeTopics,
        pendingRequests: 0,
        onlineNow,
        totalMessages,
      },
    };
    await setCache('admin:stats', payload, 30);
    res.json(payload);
  } catch (error) {
    logError(error as Error, { context: 'Admin stats' });
    throw new CustomError('Failed to get admin stats', 500, 'ADMIN_STATS_ERROR');
  }
};

export const getAdminAnalytics = async (req: Request, res: Response) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days as string, 10) || 7, 1), 90);

    const cacheKey = `admin:analytics:${days}`;
    const cached = await getCache<Record<string, unknown>>(cacheKey);
    if (cached) return res.json(cached);

    const [usersResult, topicsResult, messagesResult] = await Promise.all([
      query(
        `SELECT DATE(created_at) AS date, COUNT(*) AS count
         FROM users
         WHERE created_at >= NOW() - INTERVAL '1 day' * $1
         GROUP BY DATE(created_at)
         ORDER BY date ASC`,
        [days]
      ),
      query(
        `SELECT DATE(created_at) AS date, COUNT(*) AS count
         FROM topics
         WHERE created_at >= NOW() - INTERVAL '1 day' * $1
         GROUP BY DATE(created_at)
         ORDER BY date ASC`,
        [days]
      ),
      query(
        `SELECT DATE(created_at) AS date, COUNT(*) AS count
         FROM messages
         WHERE created_at >= NOW() - INTERVAL '1 day' * $1
         GROUP BY DATE(created_at)
         ORDER BY date ASC`,
        [days]
      ),
    ]);

    const usersByDay = (usersResult.rows as { date: string; count: string }[]).map((r) => ({
      date: r.date,
      count: parseInt(r.count, 10),
    }));
    const topicsByDay = (topicsResult.rows as { date: string; count: string }[]).map((r) => ({
      date: r.date,
      count: parseInt(r.count, 10),
    }));
    const messagesByDay = (messagesResult.rows as { date: string; count: string }[]).map((r) => ({
      date: r.date,
      count: parseInt(r.count, 10),
    }));

    const payload = { analytics: { usersByDay, topicsByDay, messagesByDay, days } };
    await setCache(cacheKey, payload, 60);
    res.json(payload);
  } catch (error) {
    logError(error as Error, { context: 'Admin analytics' });
    throw new CustomError('Failed to get analytics', 500, 'ADMIN_ANALYTICS_ERROR');
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
    await invalidateCache('admin:*');
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
    await invalidateCache('admin:*');
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
    await invalidateCache('admin:*');
    await invalidateCache('topics:*');
    await invalidateCache(`topic:${id}`);
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

export const getAdminReports = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 50, 100);
    const offset = Math.max(parseInt(req.query.offset as string, 10) || 0, 0);
    const status = req.query.status as ContentReportModel.ReportStatus | undefined;
    if (status && !['pending', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status filter' });
    }

    const reports = await ContentReportModel.getAdminReportList(limit, offset, status);
    res.json({ reports, limit, offset });
  } catch (error) {
    logError(error as Error, { context: 'Admin reports' });
    throw new CustomError('Failed to get reports', 500, 'ADMIN_REPORTS_ERROR');
  }
};

export const resolveAdminReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const { action } = req.body;
    if (!action || (action !== 'resolved' && action !== 'dismissed')) {
      return res.status(400).json({ error: 'Action must be "resolved" or "dismissed"' });
    }

    const report = await ContentReportModel.getReportById(id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    if (report.status !== 'pending') {
      return res.status(400).json({ error: 'Report already resolved' });
    }

    const updated = await ContentReportModel.resolveReport(id, userId, action);
    if (!updated) return res.status(500).json({ error: 'Failed to resolve report' });

    try {
      await AdminActivityLog.createAdminLog({
        adminUserId: userId,
        action: 'report_resolved',
        targetType: 'report',
        targetId: id,
        metadata: { target_message_id: report.target_id, action },
      });
    } catch (logErr) {
      logError(logErr as Error, { context: 'Admin activity log', action: 'report_resolved' });
    }

    await invalidateCache('admin:*');
    res.json({ report: updated });
  } catch (error) {
    logError(error as Error, { context: 'Admin resolve report' });
    throw new CustomError('Failed to resolve report', 500, 'ADMIN_RESOLVE_REPORT_ERROR');
  }
};

export const deleteAdminMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const message = await MessageModel.getMessageById(id);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    await MessageModel.adminDeleteMessage(id);

    try {
      await AdminActivityLog.createAdminLog({
        adminUserId: userId,
        action: 'message_deleted_by_admin',
        targetType: 'message',
        targetId: id,
        metadata: { topic_id: message.topic_id, content_preview: message.content.slice(0, 100) },
      });
    } catch (logErr) {
      logError(logErr as Error, { context: 'Admin activity log', action: 'message_deleted_by_admin' });
    }

    await invalidateCache('admin:*');
    if (message?.topic_id) await invalidateCache(`topic:${message.topic_id}`);
    res.json({ message: 'Message deleted' });
  } catch (error) {
    logError(error as Error, { context: 'Admin delete message' });
    throw new CustomError('Failed to delete message', 500, 'ADMIN_DELETE_MESSAGE_ERROR');
  }
};

export const hideAdminMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const message = await MessageModel.getMessageById(id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.hidden_at) {
      return res.status(400).json({ error: 'Message already hidden' });
    }

    const hidden = await MessageModel.adminHideMessage(id);
    if (!hidden) return res.status(500).json({ error: 'Failed to hide message' });

    try {
      await AdminActivityLog.createAdminLog({
        adminUserId: userId,
        action: 'message_hidden_by_admin',
        targetType: 'message',
        targetId: id,
        metadata: { topic_id: message.topic_id, content_preview: message.content.slice(0, 100) },
      });
    } catch (logErr) {
      logError(logErr as Error, { context: 'Admin activity log', action: 'message_hidden_by_admin' });
    }

    await invalidateCache('admin:*');
    if (message?.topic_id) await invalidateCache(`topic:${message.topic_id}`);
    res.json({ message: hidden });
  } catch (error) {
    logError(error as Error, { context: 'Admin hide message' });
    throw new CustomError('Failed to hide message', 500, 'ADMIN_HIDE_MESSAGE_ERROR');
  }
};
