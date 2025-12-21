import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as MessageController from '../controllers/messageController';

export const messageRoutes = Router();

// All message routes require authentication
messageRoutes.use(authenticate);

messageRoutes.get('/topic/:topicId', MessageController.getMessages);
messageRoutes.post('/', MessageController.createMessage);
messageRoutes.delete('/:id', MessageController.deleteMessage);

