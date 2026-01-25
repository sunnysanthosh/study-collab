import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import {
  getAdminStats,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  getAdminTopics,
  deleteAdminTopic,
  getAdminActivityLogs,
} from '../controllers/adminController';

export const adminRoutes = Router();

adminRoutes.use(authenticate);
adminRoutes.use(requireAdmin);

adminRoutes.get('/stats', getAdminStats);
adminRoutes.get('/users', getAdminUsers);
adminRoutes.patch('/users/:id', updateAdminUser);
adminRoutes.delete('/users/:id', deleteAdminUser);
adminRoutes.get('/topics', getAdminTopics);
adminRoutes.delete('/topics/:id', deleteAdminTopic);
adminRoutes.get('/activity-logs', getAdminActivityLogs);
