import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { io, Socket } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { spawn, execSync } from 'child_process';
import path from 'path';
import net from 'net';
import { createClient } from 'redis';
import {
  ensureDockerDb,
  waitForDb,
  migrateAndSeed,
  resetDb,
  closeDb,
} from '../../api/tests/helpers/dbTestSetup';

const WS_PORT = 3102;
const WS_URL = `http://localhost:${WS_PORT}`;
const JWT_SECRET = 'test-secret';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const isPortOpen = (port: number) =>
  new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ port, host: '127.0.0.1' });
    socket.on('connect', () => {
      socket.end();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
  });

const ensureRedis = async () => {
  if (await isPortOpen(6379)) {
    return;
  }

  try {
    execSync('docker ps -a --format "{{.Names}}"', { stdio: 'pipe' });
  } catch {
    throw new Error('Redis is required for broker tests');
  }

  const containers = execSync('docker ps -a --format "{{.Names}}"')
    .toString()
    .split('\n')
    .map((name) => name.trim());

  if (containers.includes('studycollab-redis')) {
    execSync('docker start studycollab-redis', { stdio: 'inherit' });
  } else {
    execSync('docker run -d --name studycollab-redis -p 6379:6379 redis:7-alpine', {
      stdio: 'inherit',
    });
  }

  await sleep(1000);
};

const waitForEvent = <T>(socket: Socket, event: string, timeout = 5000) =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for ${event}`));
    }, timeout);
    socket.once(event, (payload: T) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });

describe('websocket integration', () => {
  let serverProcess: ReturnType<typeof spawn> | null = null;

  beforeAll(async () => {
    process.env.JWT_SECRET = JWT_SECRET;
    process.env.DATABASE_URL =
      process.env.TEST_DATABASE_URL ||
      'postgresql://studycollab:studycollab@localhost:5432/studycollab';
    process.env.REDIS_URL = REDIS_URL;

    await ensureDockerDb();
    await waitForDb();
    await migrateAndSeed();
    await resetDb();
    await ensureRedis();

    serverProcess = spawn('npx', ['tsx', 'src/server.ts'], {
      cwd: path.resolve(__dirname, '..'),
      env: {
        ...process.env,
        PORT: String(WS_PORT),
        FRONTEND_URL: 'http://localhost:3000',
        JWT_SECRET,
      },
      stdio: 'inherit',
    });

    await sleep(2000);
  }, 30000);

  afterAll(async () => {
    if (serverProcess) {
      serverProcess.kill();
    }
    await closeDb();
  });

  it(
    'connects, joins rooms, and receives notifications',
    async () => {
    const pool = (await import('../../api/src/db/connection')).default;

    const users = await pool.query(
      'SELECT id, email FROM users WHERE email IN ($1, $2) ORDER BY email',
      ['student@studycollab.com', 'test@studycollab.com']
    );
    const userA = users.rows[0];
    const userB = users.rows[1];

    const topics = await pool.query('SELECT id FROM topics LIMIT 1');
    const topicId = topics.rows[0].id as string;

    await pool.query(
      `INSERT INTO topic_members (topic_id, user_id)
       VALUES ($1, $2), ($1, $3)
       ON CONFLICT DO NOTHING`,
      [topicId, userA.id, userB.id]
    );

    const tokenA = jwt.sign({ userId: userA.id, email: userA.email }, JWT_SECRET, { expiresIn: '1h' });
    const tokenB = jwt.sign({ userId: userB.id, email: userB.email }, JWT_SECRET, { expiresIn: '1h' });

    const socketA = io(WS_URL, { auth: { token: tokenA } });
    const socketB = io(WS_URL, { auth: { token: tokenB } });

    await Promise.all([
      waitForEvent(socketA, 'connect'),
      waitForEvent(socketB, 'connect'),
    ]);

    await sleep(200);

    const roomUsersPromise = waitForEvent<{ users: Array<{ userId: string }> }>(
      socketB,
      'room-users',
      10000
    ).catch(() => null);
    const historyPromise = waitForEvent<{ messages: Array<{ id: string }> }>(
      socketB,
      'message-history',
      10000
    );
    socketA.emit('join-room', { roomId: topicId });
    socketB.emit('join-room', { roomId: topicId });

    const history = await historyPromise;
    expect(Array.isArray(history.messages)).toBe(true);

    const roomUsers = await roomUsersPromise;
    if (roomUsers) {
      const userIds = roomUsers.users.map((user) => user.userId);
      expect(userIds).toContain(userA.id);
      expect(userIds).toContain(userB.id);
    }

    const notificationPromise = waitForEvent(socketB, 'notification', 10000);
    socketA.emit('message', { roomId: topicId, text: 'Hello from websocket test' });

    const message = await waitForEvent<{ text: string }>(socketA, 'message');
    expect(message.text).toContain('Hello from websocket test');

    const notification = await notificationPromise;
    expect(notification).toBeTruthy();

    socketA.disconnect();
    socketB.disconnect();
    },
    15000
  );

  it('receives notifications from broker events', async () => {
    const pool = (await import('../../api/src/db/connection')).default;
    const userResult = await pool.query(
      'SELECT id, email FROM users WHERE email = $1 LIMIT 1',
      ['test@studycollab.com']
    );
    const user = userResult.rows[0];

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    const socket = io(WS_URL, { auth: { token } });

    await waitForEvent(socket, 'connect');

    const redisClient = createClient({ url: REDIS_URL });
    await redisClient.connect();

    const notificationPromise = waitForEvent(socket, 'notification', 10000);
    await redisClient.publish(
      'notification.created',
      JSON.stringify({
        userId: user.id,
        notification: { id: 'broker-1', title: 'Broker Test' },
      })
    );

    const notification = await notificationPromise;
    expect(notification).toEqual(expect.objectContaining({ id: 'broker-1' }));

    await redisClient.disconnect();
    socket.disconnect();
  });
});
