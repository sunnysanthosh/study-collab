import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import {
  getAdminStats,
  getAdminAnalytics,
  createAdminUser,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  getAdminTopics,
  deleteAdminTopic,
  getAdminActivityLogs,
  getAdminReports,
  resolveAdminReport,
  deleteAdminMessage,
  hideAdminMessage,
} from '../controllers/adminController';

export const adminRoutes = Router();

adminRoutes.use(authenticate);
adminRoutes.use(requireAdmin);

adminRoutes.get('/stats', getAdminStats);
adminRoutes.get('/analytics', getAdminAnalytics);
adminRoutes.post('/users', createAdminUser);
adminRoutes.get('/users', getAdminUsers);
adminRoutes.patch('/users/:id', updateAdminUser);
adminRoutes.delete('/users/:id', deleteAdminUser);
adminRoutes.get('/topics', getAdminTopics);
adminRoutes.delete('/topics/:id', deleteAdminTopic);
adminRoutes.get('/activity-logs', getAdminActivityLogs);
adminRoutes.get('/reports', getAdminReports);
adminRoutes.patch('/reports/:id', resolveAdminReport);
adminRoutes.delete('/messages/:id', deleteAdminMessage);
adminRoutes.patch('/messages/:id/hide', hideAdminMessage);
