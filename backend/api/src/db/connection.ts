import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
import { logInfo, logError, logQuery } from '../utils/logger';

dotenv.config();

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://studycollab:studycollab@localhost:5432/studycollab',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(poolConfig);

// Test connection
pool.on('connect', () => {
  logInfo('Database connected');
});

pool.on('error', (err) => {
  logError(err, { context: 'Database pool error' });
  process.exit(-1);
});

// Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logQuery(text, params, duration);
    return res;
  } catch (error) {
    logQuery(text, params, Date.now() - start, error as Error);
    throw error;
  }
};

// Helper function to get a client from the pool
export const getClient = () => {
  return pool.connect();
};

export default pool;

