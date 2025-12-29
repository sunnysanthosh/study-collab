"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.getFileUrl = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure uploads directory exists
const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Create subdirectories by type
        const type = req.body.type || 'general';
        const typeDir = path_1.default.join(uploadsDir, type);
        if (!fs_1.default.existsSync(typeDir)) {
            fs_1.default.mkdirSync(typeDir, { recursive: true });
        }
        cb(null, typeDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-random-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        const name = path_1.default.basename(file.originalname, ext);
        cb(null, `${uniqueSuffix}-${name}${ext}`);
    },
});
// File filter
const fileFilter = (req, file, cb) => {
    // Allow images, PDFs, and common document types
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/markdown',
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: images, PDFs, documents.`));
    }
};
// Configure multer
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
});
// Get file URL helper
const getFileUrl = (filePath) => {
    // Extract the relative path from uploads directory
    const uploadsIndex = filePath.indexOf('uploads');
    if (uploadsIndex === -1) {
        return filePath;
    }
    const relativePath = filePath.substring(uploadsIndex);
    // Convert to URL path: uploads/general/file.jpg -> /api/files/uploads/general/file.jpg
    return `/api/files/${relativePath}`;
};
exports.getFileUrl = getFileUrl;
// Delete file helper
const deleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs_1.default.unlink(filePath, (err) => {
            if (err && err.code !== 'ENOENT') {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
};
exports.deleteFile = deleteFile;
