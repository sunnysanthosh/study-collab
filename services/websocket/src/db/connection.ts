import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

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
  console.log('✅ WebSocket: Database connected');
});

pool.on('error', (err) => {
  console.error('❌ WebSocket: Unexpected database error:', err);
});

// Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    console.error('WebSocket Query error:', error);
    throw error;
  }
};

// Helper function to get a client from the pool
export const getClient = () => {
  return pool.connect();
};

export default pool;

