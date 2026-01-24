import dotenv from 'dotenv';
import pool from './db/connection';
import logger, { logInfo, logError } from './utils/logger';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3001;

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

