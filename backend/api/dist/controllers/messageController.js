"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReactions = exports.addReaction = exports.removeMessage = exports.editMessage = exports.postMessage = exports.getMessages = void 0;
const Message_1 = require("../models/Message");
const MessageReaction_1 = require("../models/MessageReaction");
const getMessages = async (req, res) => {
    try {
        const { topicId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const messages = await (0, Message_1.getMessagesByTopic)(topicId, limit, offset);
        // Get reactions and attachments for messages
        const messageIds = messages.map(m => m.id);
        const [reactions, reactionCounts] = await Promise.all([
            Promise.all(messageIds.map(id => MessageReaction_1.MessageReactionModel.getByMessageId(id))),
            MessageReaction_1.MessageReactionModel.getReactionCounts(messageIds),
        ]);
        const messagesWithExtras = messages.map((message, index) => ({
            ...message,
            reactions: reactions[index],
            reaction_counts: reactionCounts[message.id] || {},
        }));
        res.json({ messages: messagesWithExtras });
    }
    catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to get messages' });
    }
};
exports.getMessages = getMessages;
const postMessage = async (req, res) => {
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
        const message = await (0, Message_1.createMessage)({
            topic_id: topicId,
            user_id: userId,
            content: content.trim(),
        });
        res.status(201).json({ message });
    }
    catch (error) {
        console.error('Post message error:', error);
        res.status(500).json({ error: 'Failed to post message' });
    }
};
exports.postMessage = postMessage;
const editMessage = async (req, res) => {
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
        const message = await (0, Message_1.updateMessage)(messageId, userId, content.trim());
        if (!message) {
            return res.status(404).json({ error: 'Message not found or permission denied' });
        }
        res.json({ message });
    }
    catch (error) {
        console.error('Edit message error:', error);
        res.status(500).json({ error: 'Failed to edit message' });
    }
};
exports.editMessage = editMessage;
const removeMessage = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const { messageId } = req.params;
        const deleted = await (0, Message_1.deleteMessage)(messageId, userId);
        if (!deleted) {
            return res.status(404).json({ error: 'Message not found or permission denied' });
        }
        res.json({ message: 'Message deleted successfully' });
    }
    catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
};
exports.removeMessage = removeMessage;
const addReaction = async (req, res) => {
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
        const reaction = await MessageReaction_1.MessageReactionModel.create({
            message_id: messageId,
            user_id: userId,
            emoji,
        });
        res.json({ reaction });
    }
    catch (error) {
        console.error('Add reaction error:', error);
        res.status(500).json({ error: 'Failed to add reaction' });
    }
};
exports.addReaction = addReaction;
const getReactions = async (req, res) => {
    try {
        const { messageId } = req.params;
        const reactions = await MessageReaction_1.MessageReactionModel.getByMessageId(messageId);
        res.json({ reactions });
    }
    catch (error) {
        console.error('Get reactions error:', error);
        res.status(500).json({ error: 'Failed to get reactions' });
    }
};
exports.getReactions = getReactions;
