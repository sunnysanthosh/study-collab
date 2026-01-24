import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { topicRoutes } from './routes/topics';
import { messageRoutes } from './routes/messages';
import { fileRoutes } from './routes/files';
import { notificationRoutes } from './routes/notifications';
import { logRoutes } from './routes/logs';
import pool from './db/connection';
import path from 'path';
import logger, { logInfo, logError } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// Request logging (before routes)
app.use(requestLogger);

// Serve uploaded files (must be before fileRoutes to handle static files)
// Serve files from uploads directory at /api/files/uploads/*
app.use('/api/files/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res, filePath) => {
    // Set appropriate headers for file downloads
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    }
  }
}));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/logs', logRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Initialize database connection
pool.query('SELECT NOW()')
  .then(async () => {
    logInfo('Database connection established');
    
    // Auto-seed in demo mode
    if (process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'demo') {
      try {
        logInfo('Demo mode enabled - checking for demo data');
        const userCount = await pool.query('SELECT COUNT(*) FROM users');
        const topicCount = await pool.query('SELECT COUNT(*) FROM topics');
        
        if (userCount.rows[0].count === '0' || topicCount.rows[0].count === '0') {
          logInfo('Demo data not found - seeding');
          const seed = (await import('./db/seed')).default;
          await seed();
          logInfo('Demo data seeded successfully');
        } else {
          logInfo('Demo data already exists');
        }
      } catch (error) {
        logError(error as Error, { context: 'Demo seeding' });
        logInfo('You can manually run: npm run seed');
      }
    }
    
    // Start server
    app.listen(PORT, () => {
      logInfo(`API server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        demoMode: process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'demo',
      });
    });
  })
  .catch((error) => {
    logError(error as Error, { context: 'Database connection' });
    logInfo('Server will start but database operations will fail');
    logInfo('Make sure PostgreSQL is running and DATABASE_URL is set correctly');
    
    // Start server anyway (for development)
    app.listen(PORT, () => {
      logInfo(`API server running on port ${PORT} (without database)`, {
        port: PORT,
        warning: 'Database connection failed',
      });
    });
  });

