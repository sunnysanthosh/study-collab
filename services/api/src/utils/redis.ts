import { createClient, RedisClientType } from 'redis';

const REDIS_CHANNEL = 'notification.created';

let client: RedisClientType | null = null;
let connecting = false;

const getClient = async () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  if (!client) {
    client = createClient({ url: redisUrl });
    client.on('error', (error) => {
      console.error('Redis publish error:', error);
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
