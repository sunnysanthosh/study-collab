import { Request, Response } from 'express';
import * as TopicModel from '../models/Topic';
import * as TopicMemberModel from '../models/TopicMember';
import * as MessageModel from '../models/Message';
import { TopicFavoriteModel } from '../models/TopicFavorite';
import { logError } from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

export const getTopics = async (req: Request, res: Response) => {
  try {
    const { search, subject, difficulty, category, tags, limit, offset, sort, order, created_from, created_to } = req.query;
    
    const filters: any = {};
    if (search) filters.search = search as string;
    if (subject) filters.subject = subject as string;
    if (difficulty) filters.difficulty = difficulty as string;
    if (category) filters.category = category as string;
    if (tags) {
      const tagList = Array.isArray(tags)
        ? (tags as string[])
        : String(tags).split(',').map((tag) => tag.trim()).filter(Boolean);
      if (tagList.length > 0) {
        filters.tags = tagList;
      }
    }
    if (limit) filters.limit = Math.min(parseInt(limit as string, 10) || 50, 100);
    if (offset) filters.offset = Math.max(parseInt(offset as string, 10) || 0, 0);
    if (sort && (sort === 'created_at' || sort === 'title' || sort === 'popularity')) filters.sort = sort;
    if (order && (order === 'asc' || order === 'desc')) filters.order = order;
    if (created_from && !Number.isNaN(Date.parse(String(created_from)))) {
      filters.createdFrom = String(created_from);
    }
    if (created_to && !Number.isNaN(Date.parse(String(created_to)))) {
      filters.createdTo = String(created_to);
    }
    
    const topics = await TopicModel.getAllTopics(filters);
    
    res.json({
      topics,
      count: topics.length,
      limit: filters.limit ?? 50,
      offset: filters.offset ?? 0,
    });
  } catch (error) {
    logError(error as Error, { context: 'Topic operation' }); throw new CustomError('Operation failed', 500, 'TOPIC_ERROR');
    res.status(500).json({ error: 'Failed to get topics' });
  }
};

export const createTopic = async (req: Request, res: Response) => {
  try {
    const { title, description, category, subject, difficulty, tags } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const topic = await TopicModel.createTopic({
      title,
      description,
      category,
      subject,
      difficulty,
      tags: Array.isArray(tags) ? tags : undefined,
      created_by: userId,
    });
    
    // Automatically add creator as member
    await TopicMemberModel.addMemberToTopic(topic.id, userId);
    
    res.status(201).json(topic);
  } catch (error) {
    logError(error as Error, { context: 'Create topic', userId: req.user?.userId });
    throw new CustomError('Failed to create topic', 500, 'CREATE_TOPIC_ERROR');
  }
};

export const getTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const topic = await TopicModel.getTopicById(id);
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    // Get members
    const members = await TopicMemberModel.getTopicMembers(id);
    
    // Get messages
    const messages = await MessageModel.getMessagesByTopic(id, 50, 0, 'desc');
    
    res.json({
      ...topic,
      members,
      messages: messages.reverse(),
    });
  } catch (error) {
    const { id } = req.params;
    logError(error as Error, { context: 'Get topic', topicId: id });
    throw new CustomError('Failed to get topic', 500, 'GET_TOPIC_ERROR');
  }
};

export const updateTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user is the creator
    const topic = await TopicModel.getTopicById(id);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    if (topic.created_by !== userId) {
      return res.status(403).json({ error: 'Only the creator can update this topic' });
    }
    
    const updatedTopic = await TopicModel.updateTopic(id, req.body);
    
    res.json(updatedTopic);
  } catch (error) {
    const { id } = req.params;
    logError(error as Error, { context: 'Update topic', topicId: id, userId: req.user?.userId });
    throw new CustomError('Failed to update topic', 500, 'UPDATE_TOPIC_ERROR');
  }
};

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user is the creator
    const topic = await TopicModel.getTopicById(id);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    if (topic.created_by !== userId) {
      return res.status(403).json({ error: 'Only the creator can delete this topic' });
    }
    
    await TopicModel.deleteTopic(id);
    
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    const { id } = req.params;
    logError(error as Error, { context: 'Delete topic', topicId: id, userId: req.user?.userId });
    throw new CustomError('Failed to delete topic', 500, 'DELETE_TOPIC_ERROR');
  }
};

export const joinTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify topic exists
    const topic = await TopicModel.getTopicById(id);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    await TopicMemberModel.addMemberToTopic(id, userId);
    
    res.json({ message: 'Joined topic successfully' });
  } catch (error) {
    const { id } = req.params;
    logError(error as Error, { context: 'Join topic', topicId: id, userId: req.user?.userId });
    throw new CustomError('Failed to join topic', 500, 'JOIN_TOPIC_ERROR');
  }
};

export const leaveTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    await TopicMemberModel.removeMemberFromTopic(id, userId);
    
    res.json({ message: 'Left topic successfully' });
  } catch (error) {
    const { id } = req.params;
    logError(error as Error, { context: 'Leave topic', topicId: id, userId: req.user?.userId });
    throw new CustomError('Failed to leave topic', 500, 'LEAVE_TOPIC_ERROR');
  }
};

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const favorites = await TopicFavoriteModel.getUserFavorites(userId);
    res.json({ favorites });
  } catch (error) {
    logError(error as Error, { context: 'Get favorites', userId: req.user?.userId });
    throw new CustomError('Failed to get favorites', 500, 'GET_FAVORITES_ERROR');
  }
};

export const addFavorite = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const topic = await TopicModel.getTopicById(id);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    await TopicFavoriteModel.add(id, userId);
    res.json({ message: 'Topic favorited' });
  } catch (error) {
    const { id } = req.params;
    logError(error as Error, { context: 'Add favorite', topicId: id, userId: req.user?.userId });
    throw new CustomError('Failed to favorite topic', 500, 'ADD_FAVORITE_ERROR');
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await TopicFavoriteModel.remove(id, userId);
    res.json({ message: 'Topic unfavorited' });
  } catch (error) {
    const { id } = req.params;
    logError(error as Error, { context: 'Remove favorite', topicId: id, userId: req.user?.userId });
    throw new CustomError('Failed to unfavorite topic', 500, 'REMOVE_FAVORITE_ERROR');
  }
};

