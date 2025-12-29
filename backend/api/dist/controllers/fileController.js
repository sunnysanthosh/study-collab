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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFileAttachment = exports.getFile = exports.uploadAvatar = exports.uploadFile = exports.uploadMiddleware = void 0;
const fileStorage_1 = require("../utils/fileStorage");
const FileAttachment_1 = require("../models/FileAttachment");
const path_1 = __importDefault(require("path"));
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("../middleware/errorHandler");
const errorTracker_1 = require("../utils/errorTracker");
// Upload middleware
exports.uploadMiddleware = fileStorage_1.upload.single('file');
// Upload file
const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const fileUrl = (0, fileStorage_1.getFileUrl)(req.file.path);
        res.json({
            message: 'File uploaded successfully',
            file: {
                filename: req.file.filename,
                original_filename: req.file.originalname,
                path: req.file.path,
                url: fileUrl,
                size: req.file.size,
                mime_type: req.file.mimetype,
            },
        });
    }
    catch (error) {
        errorTracker_1.ErrorTracker.trackFileError(error, req.file?.originalname, {
            userId: req.user?.userId,
        });
        throw new errorHandler_1.CustomError('Failed to upload file', 500, 'FILE_UPLOAD_ERROR');
    }
};
exports.uploadFile = uploadFile;
// Upload avatar
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Validate image type
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({ error: 'File must be an image' });
        }
        const fileUrl = (0, fileStorage_1.getFileUrl)(req.file.path);
        // Update user avatar in database
        const { updateUser } = await Promise.resolve().then(() => __importStar(require('../models/User')));
        const updatedUser = await updateUser(userId, { avatar_url: fileUrl });
        res.json({
            message: 'Avatar uploaded successfully',
            avatar_url: updatedUser.avatar_url,
        });
    }
    catch (error) {
        errorTracker_1.ErrorTracker.trackFileError(error, req.file?.originalname, {
            userId: req.user?.userId,
            type: 'avatar',
        });
        throw new errorHandler_1.CustomError('Failed to upload avatar', 500, 'AVATAR_UPLOAD_ERROR');
    }
};
exports.uploadAvatar = uploadAvatar;
// Get file
const getFile = async (req, res) => {
    try {
        const filePath = path_1.default.join(process.cwd(), 'uploads', req.params.type || 'general', req.params.filename);
        res.sendFile(filePath, (err) => {
            if (err) {
                (0, logger_1.logError)(err, { context: 'File serve', filePath });
                res.status(404).json({ error: 'File not found' });
            }
        });
    }
    catch (error) {
        (0, logger_1.logError)(error, { context: 'Get file', filePath: req.params.filename });
        throw new errorHandler_1.CustomError('Failed to get file', 500, 'FILE_GET_ERROR');
    }
};
exports.getFile = getFile;
// Delete file
const deleteFileAttachment = async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Delete from database (includes permission check)
        const file = await FileAttachment_1.FileAttachmentModel.delete(fileId, userId);
        // Delete physical file
        await (0, fileStorage_1.deleteFile)(file.file_path);
        res.json({ message: 'File deleted successfully' });
    }
    catch (error) {
        (0, logger_1.logError)(error, { context: 'Delete file', fileId: req.params.fileId, userId: req.user?.userId });
        if (error.message === 'Permission denied') {
            throw new errorHandler_1.CustomError('Permission denied', 403, 'FILE_DELETE_PERMISSION_DENIED');
        }
        if (error.message === 'File attachment not found') {
            throw new errorHandler_1.CustomError('File attachment not found', 404, 'FILE_NOT_FOUND');
        }
        throw new errorHandler_1.CustomError('Failed to delete file', 500, 'FILE_DELETE_ERROR');
    }
};
exports.deleteFileAttachment = deleteFileAttachment;
