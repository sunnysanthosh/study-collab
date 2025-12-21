import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { topicRoutes } from './routes/topics';
import { messageRoutes } from './routes/messages';
import pool from './db/connection';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Initialize database connection
pool.query('SELECT NOW()')
  .then(async () => {
    console.log('✅ Database connection established');
    
    // Auto-seed in demo mode
    if (process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'demo') {
      try {
        console.log('🎭 Demo mode enabled - checking for demo data...');
        const userCount = await pool.query('SELECT COUNT(*) FROM users');
        const topicCount = await pool.query('SELECT COUNT(*) FROM topics');
        
        if (userCount.rows[0].count === '0' || topicCount.rows[0].count === '0') {
          console.log('🌱 Demo data not found - seeding...');
          const seed = (await import('./db/seed')).default;
          await seed();
          console.log('✅ Demo data seeded successfully');
        } else {
          console.log('✅ Demo data already exists');
        }
      } catch (error) {
        console.error('⚠️  Demo seeding failed:', error);
        console.log('💡 You can manually run: npm run seed');
      }
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 API server running on port ${PORT}`);
      if (process.env.DEMO_MODE === 'true' || process.env.NODE_ENV === 'demo') {
        console.log('🎭 Demo mode: ON');
      }
    });
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error);
    console.log('⚠️  Server will start but database operations will fail');
    console.log('💡 Make sure PostgreSQL is running and DATABASE_URL is set correctly');
    
    // Start server anyway (for development)
    app.listen(PORT, () => {
      console.log(`🚀 API server running on port ${PORT} (without database)`);
    });
  });

