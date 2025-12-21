import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getProfile, updateProfile, uploadAvatar } from '../controllers/userController';

export const userRoutes = Router();

// All user routes require authentication
userRoutes.use(authenticate);

userRoutes.get('/profile', getProfile);
userRoutes.put('/profile', updateProfile);
userRoutes.post('/avatar', uploadAvatar);

