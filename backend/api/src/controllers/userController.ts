import { Request, Response } from 'express';
import * as UserModel from '../models/User';
import { logError } from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const user = await UserModel.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      role: user.role,
      created_at: user.created_at,
    });
  } catch (error) {
    logError(error as Error, { context: 'Get profile', userId: req.user?.userId });
    throw new CustomError('Failed to get profile', 500, 'GET_PROFILE_ERROR');
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { name, email, password, avatar_url } = req.body;
    
    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      
      // Check if email is already taken by another user
      const existingUser = await UserModel.getUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }
    
    const updatedUser = await UserModel.updateUser(userId, {
      name,
      email,
      password,
      avatar_url,
    });
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar_url: updatedUser.avatar_url,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    logError(error as Error, { context: 'Update profile', userId: req.user?.userId });
    throw new CustomError('Failed to update profile', 500, 'UPDATE_PROFILE_ERROR');
  }
};

// Avatar upload is now handled by fileController
// This endpoint is kept for backward compatibility (URL-based avatars)
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Accept avatar_url from request body (for URL-based avatars)
    const { avatar_url } = req.body;
    
    if (!avatar_url) {
      return res.status(400).json({ error: 'Avatar URL is required' });
    }
    
    const updatedUser = await UserModel.updateUser(userId, { avatar_url });
    
    res.json({
      message: 'Avatar updated successfully',
      avatar_url: updatedUser.avatar_url,
    });
  } catch (error) {
    logError(error as Error, { context: 'Upload avatar (URL)', userId: req.user?.userId });
    throw new CustomError('Failed to upload avatar', 500, 'AVATAR_UPLOAD_URL_ERROR');
  }
};

