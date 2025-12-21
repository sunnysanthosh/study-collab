import { Router } from 'express';
import { getProfile, updateProfile, uploadAvatar } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

export const userRoutes = Router();

userRoutes.get('/me', authenticate, getProfile);
userRoutes.put('/me', authenticate, updateProfile);
userRoutes.put('/me/avatar', authenticate, uploadAvatar);

