import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { topicRoutes } from './routes/topics';
import { messageRoutes } from './routes/messages';
import { fileRoutes } from './routes/files';
import { notificationRoutes } from './routes/notifications';
import { logRoutes } from './routes/logs';
import { adminRoutes } from './routes/admin';
import path from 'path';
import rateLimit from 'express-rate-limit';

const app = express();

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
app.use('/api/files/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res, filePath) => {
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
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

export default app;
