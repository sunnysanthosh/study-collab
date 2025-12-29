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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
const auth_1 = require("./routes/auth");
const users_1 = require("./routes/users");
const topics_1 = require("./routes/topics");
const messages_1 = require("./routes/messages");
const files_1 = require("./routes/files");
const notifications_1 = require("./routes/notifications");
const logs_1 = require("./routes/logs");
const connection_1 = __importDefault(require("./db/connection"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging (before routes)
app.use(requestLogger_1.requestLogger);
// Serve uploaded files (must be before fileRoutes to handle static files)
// Serve files from uploads directory at /api/files/uploads/*
app.use('/api/files/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads'), {
    setHeaders: (res, filePath) => {
        // Set appropriate headers for file downloads
        if (filePath.endsWith('.pdf')) {
            res.setHeader('Content-Type', 'application/pdf');
        }
    }
}));
// Routes
app.use('/api/auth', auth_1.authRoutes);
app.use('/api/users', users_1.userRoutes);
app.use('/api/topics', topics_1.topicRoutes);
app.use('/api/messages', messages_1.messageRoutes);
app.use('/api/files', files_1.fileRoutes);
app.use('/api/notifications', notifications_1.notificationRoutes);
app.use('/api/logs', logs_1.logRoutes);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handling
app.use(errorHandler_1.errorHandler);
// Initialize database connection
connection_1.default.query('SELECT NOW()')
    .then(async () => {
    (0, logger_1.logInfo)('Database connection established');
    // Auto-seed in demo mode
    if (process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'demo') {
        try {
            (0, logger_1.logInfo)('Demo mode enabled - checking for demo data');
            const userCount = await connection_1.default.query('SELECT COUNT(*) FROM users');
            const topicCount = await connection_1.default.query('SELECT COUNT(*) FROM topics');
            if (userCount.rows[0].count === '0' || topicCount.rows[0].count === '0') {
                (0, logger_1.logInfo)('Demo data not found - seeding');
                const seed = (await Promise.resolve().then(() => __importStar(require('./db/seed')))).default;
                await seed();
                (0, logger_1.logInfo)('Demo data seeded successfully');
            }
            else {
                (0, logger_1.logInfo)('Demo data already exists');
            }
        }
        catch (error) {
            (0, logger_1.logError)(error, { context: 'Demo seeding' });
            (0, logger_1.logInfo)('You can manually run: npm run seed');
        }
    }
    // Start server
    app.listen(PORT, () => {
        (0, logger_1.logInfo)(`API server running on port ${PORT}`, {
            port: PORT,
            environment: process.env.NODE_ENV || 'development',
            demoMode: process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'demo',
        });
    });
})
    .catch((error) => {
    (0, logger_1.logError)(error, { context: 'Database connection' });
    (0, logger_1.logInfo)('Server will start but database operations will fail');
    (0, logger_1.logInfo)('Make sure PostgreSQL is running and DATABASE_URL is set correctly');
    // Start server anyway (for development)
    app.listen(PORT, () => {
        (0, logger_1.logInfo)(`API server running on port ${PORT} (without database)`, {
            port: PORT,
            warning: 'Database connection failed',
        });
    });
});
