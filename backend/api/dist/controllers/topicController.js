"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveTopic = exports.joinTopic = exports.deleteTopic = exports.updateTopic = exports.getTopic = exports.createTopic = exports.getTopics = void 0;
const TopicModel = __importStar(require("../models/Topic"));
const TopicMemberModel = __importStar(require("../models/TopicMember"));
const MessageModel = __importStar(require("../models/Message"));
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const getTopics = async (req, res) => {
    try {
        const { search, subject, difficulty } = req.query;
        const filters = {};
        if (search)
            filters.search = search;
        if (subject)
            filters.subject = subject;
        if (difficulty)
            filters.difficulty = difficulty;
        const topics = await TopicModel.getAllTopics(filters);
        res.json({
            topics,
            count: topics.length,
        });
    }
    catch (error) {
        (0, logger_1.logError)(error, { context: 'Topic operation' });
        throw new errorHandler_1.CustomError('Operation failed', 500, 'TOPIC_ERROR');
        res.status(500).json({ error: 'Failed to get topics' });
    }
};
exports.getTopics = getTopics;
const createTopic = async (req, res) => {
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
    }
    catch (error) {
        (0, logger_1.logError)(error, { context: 'Create topic', userId: req.user?.userId });
        throw new errorHandler_1.CustomError('Failed to create topic', 500, 'CREATE_TOPIC_ERROR');
    }
};
exports.createTopic = createTopic;
const getTopic = async (req, res) => {
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
    }
    catch (error) {
        const { id } = req.params;
        (0, logger_1.logError)(error, { context: 'Get topic', topicId: id });
        throw new errorHandler_1.CustomError('Failed to get topic', 500, 'GET_TOPIC_ERROR');
    }
};
exports.getTopic = getTopic;
const updateTopic = async (req, res) => {
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
    }
    catch (error) {
        const { id } = req.params;
        (0, logger_1.logError)(error, { context: 'Update topic', topicId: id, userId: req.user?.userId });
        throw new errorHandler_1.CustomError('Failed to update topic', 500, 'UPDATE_TOPIC_ERROR');
    }
};
exports.updateTopic = updateTopic;
const deleteTopic = async (req, res) => {
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
    }
    catch (error) {
        const { id } = req.params;
        (0, logger_1.logError)(error, { context: 'Delete topic', topicId: id, userId: req.user?.userId });
        throw new errorHandler_1.CustomError('Failed to delete topic', 500, 'DELETE_TOPIC_ERROR');
    }
};
exports.deleteTopic = deleteTopic;
const joinTopic = async (req, res) => {
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
    }
    catch (error) {
        const { id } = req.params;
        (0, logger_1.logError)(error, { context: 'Join topic', topicId: id, userId: req.user?.userId });
        throw new errorHandler_1.CustomError('Failed to join topic', 500, 'JOIN_TOPIC_ERROR');
    }
};
exports.joinTopic = joinTopic;
const leaveTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        await TopicMemberModel.removeMemberFromTopic(id, userId);
        res.json({ message: 'Left topic successfully' });
    }
    catch (error) {
        const { id } = req.params;
        (0, logger_1.logError)(error, { context: 'Leave topic', topicId: id, userId: req.user?.userId });
        throw new errorHandler_1.CustomError('Failed to leave topic', 500, 'LEAVE_TOPIC_ERROR');
    }
};
exports.leaveTopic = leaveTopic;
