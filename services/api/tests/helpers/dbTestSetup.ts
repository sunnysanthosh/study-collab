import { execSync } from 'child_process';
import path from 'path';
import net from 'net';

const databaseUrl =
  process.env.TEST_DATABASE_URL || 'postgresql://studycollab:studycollab@localhost:5432/studycollab';

const ensureEnv = () => {
  process.env.DATABASE_URL = databaseUrl;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isPortOpen = (port: number) =>
  new Promise<boolean>((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(500);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
    socket.once('timeout', () => resolve(false));
    socket.connect(port, '127.0.0.1');
  });

export const ensureDockerDb = async () => {
  if (await isPortOpen(5432)) {
    return;
  }
  const composePath = path.resolve(__dirname, '../../../../docker-compose.yml');
  try {
    execSync(`docker compose -f "${composePath}" up -d db`, { stdio: 'inherit' });
  } catch (error: any) {
    const message = String(error?.message || '');
    if (message.includes('port is already allocated')) {
      return;
    }
    throw error;
  }
};

export const waitForDb = async () => {
  ensureEnv();
  const pool = (await import('../../src/db/connection')).default;
  const maxAttempts = 20;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch {
      await sleep(1000);
    }
  }

  throw new Error('Database did not become ready in time.');
};

export const migrateAndSeed = async () => {
  ensureEnv();
  const pool = (await import('../../src/db/connection')).default;
  await pool.query('DROP SCHEMA IF EXISTS public CASCADE');
  await pool.query('CREATE SCHEMA public');
  const migrate = (await import('../../src/db/migrate')).default;
  const seed = (await import('../../src/db/seed')).default;
  await migrate();
  await seed();
};

export const resetDb = async () => {
  ensureEnv();
  const pool = (await import('../../src/db/connection')).default;
  await pool.query(`
    TRUNCATE TABLE
      message_reactions,
      messages,
      file_attachments,
      notifications,
      topic_favorites,
      topic_members,
      topics,
      user_sessions,
      token_blacklist,
      users
    RESTART IDENTITY CASCADE
  `);
  const seed = (await import('../../src/db/seed')).default;
  await seed();
};

export const closeDb = async () => {
  const pool = (await import('../../src/db/connection')).default;
  await pool.end();
};
