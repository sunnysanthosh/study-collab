import { Request, Response } from 'express';
import { upload, getFileUrl, deleteFile } from '../utils/fileStorage';
import { FileAttachmentModel } from '../models/FileAttachment';
import path from 'path';

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
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
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
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};

// Get file
export const getFile = async (req: Request, res: Response) => {
  try {
    const filePath = path.join(process.cwd(), 'uploads', req.params.type || 'general', req.params.filename);
    
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('File serve error:', err);
        res.status(404).json({ error: 'File not found' });
      }
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: 'Failed to get file' });
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
    console.error('Delete file error:', error);
    if (error.message === 'Permission denied') {
      return res.status(403).json({ error: 'Permission denied' });
    }
    if (error.message === 'File attachment not found') {
      return res.status(404).json({ error: 'File attachment not found' });
    }
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

