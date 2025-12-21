import { Router } from 'express';
import { 
  getTopics, 
  createTopic, 
  getTopic, 
  updateTopic, 
  deleteTopic,
  joinTopic,
  leaveTopic
} from '../controllers/topicController';
import { authenticate } from '../middleware/auth';

export const topicRoutes = Router();

topicRoutes.get('/', getTopics);
topicRoutes.post('/', authenticate, createTopic);
topicRoutes.get('/:id', getTopic);
topicRoutes.put('/:id', authenticate, updateTopic);
topicRoutes.delete('/:id', authenticate, deleteTopic);
topicRoutes.post('/:id/join', authenticate, joinTopic);
topicRoutes.post('/:id/leave', authenticate, leaveTopic);

