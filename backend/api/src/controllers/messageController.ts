import { Request, Response } from 'express';
import * as MessageModel from '../models/Message';
import * as TopicModel from '../models/Topic';
import * as TopicMemberModel from '../models/TopicMember';

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // Verify topic exists
    const topic = await TopicModel.getTopicById(topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    const messages = await MessageModel.getMessagesByTopic(
      topicId,
      Number(limit),
      Number(offset)
    );
    
    res.json({
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { topic_id, content } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!topic_id || !content) {
      return res.status(400).json({ error: 'Topic ID and content are required' });
    }
    
    // Verify topic exists
    const topic = await TopicModel.getTopicById(topic_id);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    // Check if user is a member of the topic
    const isMember = await TopicMemberModel.isMemberOfTopic(topic_id, userId);
    if (!isMember) {
      return res.status(403).json({ error: 'You must be a member of this topic to send messages' });
    }
    
    const message = await MessageModel.createMessage({
      topic_id,
      user_id: userId,
      content,
    });
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const deleted = await MessageModel.deleteMessage(id, userId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Message not found or you do not have permission to delete it' });
    }
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

