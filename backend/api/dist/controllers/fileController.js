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
        console.error('File upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
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
        console.error('Avatar upload error:', error);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
};
exports.uploadAvatar = uploadAvatar;
// Get file
const getFile = async (req, res) => {
    try {
        const filePath = path_1.default.join(process.cwd(), 'uploads', req.params.type || 'general', req.params.filename);
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error('File serve error:', err);
                res.status(404).json({ error: 'File not found' });
            }
        });
    }
    catch (error) {
        console.error('Get file error:', error);
        res.status(500).json({ error: 'Failed to get file' });
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
        console.error('Delete file error:', error);
        if (error.message === 'Permission denied') {
            return res.status(403).json({ error: 'Permission denied' });
        }
        if (error.message === 'File attachment not found') {
            return res.status(404).json({ error: 'File attachment not found' });
        }
        res.status(500).json({ error: 'Failed to delete file' });
    }
};
exports.deleteFileAttachment = deleteFileAttachment;
