import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { getAdminStats, getAdminUsers } from '../controllers/adminController';

export const adminRoutes = Router();

adminRoutes.use(authenticate);
adminRoutes.use(requireAdmin);

adminRoutes.get('/stats', getAdminStats);
adminRoutes.get('/users', getAdminUsers);
