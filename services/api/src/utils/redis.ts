import { createClient, RedisClientType } from 'redis';

const REDIS_CHANNEL = 'notification.created';
const CSRF_PREFIX = 'csrf:';
const CSRF_TTL_SEC = 900; // 15 min

let client: RedisClientType | null = null;
let connecting = false;

const getClient = async (): Promise<RedisClientType | null> => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  if (!client) {
    client = createClient({ url: redisUrl });
    client.on('error', (error) => {
      console.error('Redis error:', error);
    });
  }

  if (!client.isOpen && !connecting) {
    connecting = true;
    try {
      await client.connect();
    } catch (error) {
      console.error('Redis connect failed:', error);
      return null;
    } finally {
      connecting = false;
    }
  }

  return client.isOpen ? client : null;
};

export const publishNotificationEvent = async (payload: unknown) => {
  try {
    const redisClient = await getClient();
    if (!redisClient) {
      return false;
    }
    await redisClient.publish(REDIS_CHANNEL, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('Redis publish failed:', error);
    return false;
  }
};

/** CSRF token storage (Redis). Used when REDIS_URL is set and CSRF is enabled. */
export const setCsrfToken = async (token: string): Promise<boolean> => {
  try {
    const c = await getClient();
    if (!c) return false;
    await c.setEx(CSRF_PREFIX + token, CSRF_TTL_SEC, '1');
    return true;
  } catch (e) {
    console.error('Redis CSRF set failed:', e);
    return false;
  }
};

export const getCsrfToken = async (token: string): Promise<boolean> => {
  try {
    const c = await getClient();
    if (!c) return false;
    const v = await c.get(CSRF_PREFIX + token);
    return v === '1';
  } catch (e) {
    console.error('Redis CSRF get failed:', e);
    return false;
  }
};
