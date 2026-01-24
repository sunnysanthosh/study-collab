import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as FileController from '../controllers/fileController';

export const fileRoutes = Router();

// All file routes require authentication
fileRoutes.use(authenticate);

// Upload file
fileRoutes.post('/upload', FileController.uploadMiddleware, FileController.uploadFile);

// Upload avatar
fileRoutes.post('/avatar', FileController.uploadMiddleware, FileController.uploadAvatar);

// Get file (served by static middleware, but keep for backward compatibility)
fileRoutes.get('/uploads/:type/:filename', FileController.getFile);

// Delete file attachment
fileRoutes.delete('/:fileId', FileController.deleteFileAttachment);

