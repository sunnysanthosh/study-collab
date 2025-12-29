import { Request, Response } from 'express';
import * as TopicModel from '../models/Topic';
import * as TopicMemberModel from '../models/TopicMember';
import * as MessageModel from '../models/Message';
import { logError } from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

export const getTopics = async (req: Request, res: Response) => {
  try {
    const { search, subject, difficulty } = req.query;
    
    const filters: any = {};
    if (search) filters.search = search as string;
    if (subject) filters.subject = subject as string;
    if (difficulty) filters.difficulty = difficulty as string;
    
    const topics = await TopicModel.getAllTopics(filters);
    
    res.json({
      topics,
      count: topics.length,
    });
  } catch (error) {
    logError(error as Error, { context: 'Topic operation' }); throw new CustomError('Operation failed', 500, 'TOPIC_ERROR');
    res.status(500).json({ error: 'Failed to get topics' });
  }
};

export const createTopic = async (req: Request, res: Response) => {
  try {
    const { title, description, subject, difficulty, tags } = req.body;
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
    const messages = await MessageModel.getMessagesByTopic(id);
    
    res.json({
      ...topic,
      members,
      messages,
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

