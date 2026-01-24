import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import {
  getTopics,
  createTopic,
  getTopic,
  updateTopic,
  deleteTopic,
  joinTopic,
  leaveTopic,
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../controllers/topicController';

export const topicRoutes = Router();

// GET topics - optional auth (for public browsing)
topicRoutes.get('/', optionalAuthenticate, getTopics);

// GET single topic - optional auth
topicRoutes.get('/:id', optionalAuthenticate, getTopic);

// All other routes require authentication
topicRoutes.use(authenticate);

topicRoutes.get('/favorites/list', getFavorites);
topicRoutes.post('/:id/favorite', addFavorite);
topicRoutes.delete('/:id/favorite', removeFavorite);
topicRoutes.post('/', createTopic);
topicRoutes.put('/:id', updateTopic);
topicRoutes.delete('/:id', deleteTopic);
topicRoutes.post('/:id/join', joinTopic);
topicRoutes.post('/:id/leave', leaveTopic);

