import { Request, Response } from 'express';
import { upload, getFileUrl, deleteFile } from '../utils/fileStorage';
import { FileAttachmentModel } from '../models/FileAttachment';
import path from 'path';
import { logError } from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';
import { ErrorTracker } from '../utils/errorTracker';

// Upload middleware
export const uploadMiddleware = upload.single('file');

// Upload file
export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const fileUrl = getFileUrl(req.file.path);
    
    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        original_filename: req.file.originalname,
        path: req.file.path,
        url: fileUrl,
        size: req.file.size,
        mime_type: req.file.mimetype,
      },
    });
  } catch (error) {
    ErrorTracker.trackFileError(error as Error, req.file?.originalname, {
      userId: req.user?.userId,
    });
    throw new CustomError('Failed to upload file', 500, 'FILE_UPLOAD_ERROR');
  }
};

// Upload avatar
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validate image type
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'File must be an image' });
    }

    const fileUrl = getFileUrl(req.file.path);
    
    // Update user avatar in database
    const { updateUser } = await import('../models/User');
    const updatedUser = await updateUser(userId, { avatar_url: fileUrl });
    
    res.json({
      message: 'Avatar uploaded successfully',
      avatar_url: updatedUser.avatar_url,
    });
  } catch (error) {
    ErrorTracker.trackFileError(error as Error, req.file?.originalname, {
      userId: req.user?.userId,
      type: 'avatar',
    });
    throw new CustomError('Failed to upload avatar', 500, 'AVATAR_UPLOAD_ERROR');
  }
};

// Get file
export const getFile = async (req: Request, res: Response) => {
  try {
    const filePath = path.join(process.cwd(), 'uploads', req.params.type || 'general', req.params.filename);
    
    res.sendFile(filePath, (err) => {
      if (err) {
        logError(err, { context: 'File serve', filePath });
        res.status(404).json({ error: 'File not found' });
      }
    });
  } catch (error) {
    logError(error as Error, { context: 'Get file', filePath: req.params.filename });
    throw new CustomError('Failed to get file', 500, 'FILE_GET_ERROR');
  }
};

// Delete file
export const deleteFileAttachment = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Delete from database (includes permission check)
    const file = await FileAttachmentModel.delete(fileId, userId);
    
    // Delete physical file
    await deleteFile(file.file_path);
    
    res.json({ message: 'File deleted successfully' });
  } catch (error: any) {
    logError(error, { context: 'Delete file', fileId: req.params.fileId, userId: req.user?.userId });
    if (error.message === 'Permission denied') {
      throw new CustomError('Permission denied', 403, 'FILE_DELETE_PERMISSION_DENIED');
    }
    if (error.message === 'File attachment not found') {
      throw new CustomError('File attachment not found', 404, 'FILE_NOT_FOUND');
    }
    throw new CustomError('Failed to delete file', 500, 'FILE_DELETE_ERROR');
  }
};

