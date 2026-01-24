import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as MessageController from '../controllers/messageController';

export const messageRoutes = Router();

// All message routes require authentication
messageRoutes.use(authenticate);

messageRoutes.get('/topic/:topicId', MessageController.getMessages);
messageRoutes.post('/topic/:topicId', MessageController.postMessage);
messageRoutes.put('/:messageId', MessageController.editMessage);
messageRoutes.delete('/:messageId', MessageController.removeMessage);
messageRoutes.post('/:messageId/reactions', MessageController.addReaction);
messageRoutes.get('/:messageId/reactions', MessageController.getReactions);

