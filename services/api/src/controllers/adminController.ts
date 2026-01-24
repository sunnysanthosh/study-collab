import { Request, Response } from 'express';
import { query } from '../db/connection';
import { logError } from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const [usersResult, topicsResult, onlineResult] = await Promise.all([
      query('SELECT COUNT(*) AS count FROM users'),
      query('SELECT COUNT(*) AS count FROM topics'),
      query(`SELECT COUNT(*) AS count FROM user_sessions WHERE status = 'online'`),
    ]);

    const totalUsers = parseInt(usersResult.rows[0].count, 10);
    const activeTopics = parseInt(topicsResult.rows[0].count, 10);
    const onlineNow = parseInt(onlineResult.rows[0].count, 10);

    res.json({
      stats: {
        totalUsers,
        activeTopics,
        pendingRequests: 0,
        onlineNow,
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
