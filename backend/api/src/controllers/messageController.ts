import { Request, Response } from 'express';
import { createMessage, getMessagesByTopic, getMessageById, updateMessage, deleteMessage } from '../models/Message';
import { MessageReactionModel } from '../models/MessageReaction';
import { FileAttachmentModel } from '../models/FileAttachment';
import { logError } from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = await getMessagesByTopic(topicId, limit, offset);
    
    // Get reactions and attachments for messages
    const messageIds = messages.map(m => m.id);
    const [reactions, reactionCounts] = await Promise.all([
      Promise.all(messageIds.map(id => MessageReactionModel.getByMessageId(id))),
      MessageReactionModel.getReactionCounts(messageIds),
    ]);

    const messagesWithExtras = messages.map((message, index) => ({
      ...message,
      reactions: reactions[index],
      reaction_counts: reactionCounts[message.id] || {},
    }));

    res.json({ messages: messagesWithExtras });
  } catch (error) {
    const { topicId } = req.params;
    logError(error as Error, { context: 'Get messages', topicId });
    throw new CustomError('Failed to get messages', 500, 'GET_MESSAGES_ERROR');
  }
};

export const postMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { topicId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const message = await createMessage({
      topic_id: topicId,
      user_id: userId,
      content: content.trim(),
    });

    res.status(201).json({ message });
  } catch (error) {
    const { topicId } = req.params;
    logError(error as Error, { context: 'Post message', topicId, userId: req.user?.userId });
    throw new CustomError('Failed to post message', 500, 'POST_MESSAGE_ERROR');
  }
};

export const editMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { messageId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const message = await updateMessage(messageId, userId, content.trim());
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found or permission denied' });
    }

    res.json({ message });
  } catch (error) {
    const { messageId } = req.params;
    logError(error as Error, { context: 'Edit message', messageId, userId: req.user?.userId });
    throw new CustomError('Failed to edit message', 500, 'EDIT_MESSAGE_ERROR');
  }
};

export const removeMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { messageId } = req.params;
    const deleted = await deleteMessage(messageId, userId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Message not found or permission denied' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    const { messageId } = req.params;
    logError(error as Error, { context: 'Delete message', messageId, userId: req.user?.userId });
    throw new CustomError('Failed to delete message', 500, 'DELETE_MESSAGE_ERROR');
  }
};

export const addReaction = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ error: 'Emoji is required' });
    }

    const reaction = await MessageReactionModel.create({
      message_id: messageId,
      user_id: userId,
      emoji,
    });

    res.json({ reaction });
  } catch (error) {
    const { messageId } = req.params;
    logError(error as Error, { context: 'Add reaction', messageId, userId: req.user?.userId });
    throw new CustomError('Failed to add reaction', 500, 'ADD_REACTION_ERROR');
  }
};

export const getReactions = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const reactions = await MessageReactionModel.getByMessageId(messageId);
    
    res.json({ reactions });
  } catch (error) {
    const { messageId } = req.params;
    logError(error as Error, { context: 'Get reactions', messageId });
    throw new CustomError('Failed to get reactions', 500, 'GET_REACTIONS_ERROR');
  }
};
