import { createClient, RedisClientType } from 'redis';

const REDIS_CHANNEL = 'notification.created';

let subscriber: RedisClientType | null = null;
let publisher: RedisClientType | null = null;
let connectingSubscriber = false;
let connectingPublisher = false;

const getSubscriber = async () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  if (!subscriber) {
    subscriber = createClient({ url: redisUrl });
    subscriber.on('error', (error) => {
      console.error('Redis subscriber error:', error);
    });
  }

  if (!subscriber.isOpen && !connectingSubscriber) {
    connectingSubscriber = true;
    try {
      await subscriber.connect();
    } catch (error) {
      console.error('Redis subscriber connect failed:', error);
      return null;
    } finally {
      connectingSubscriber = false;
    }
  }

  return subscriber.isOpen ? subscriber : null;
};

const getPublisher = async () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  if (!publisher) {
    publisher = createClient({ url: redisUrl });
    publisher.on('error', (error) => {
      console.error('Redis publisher error:', error);
    });
  }

  if (!publisher.isOpen && !connectingPublisher) {
    connectingPublisher = true;
    try {
      await publisher.connect();
    } catch (error) {
      console.error('Redis publisher connect failed:', error);
      return null;
    } finally {
      connectingPublisher = false;
    }
  }

  return publisher.isOpen ? publisher : null;
};

export const startNotificationSubscription = async (
  handler: (payload: { userId?: string; notification?: unknown }) => void
) => {
  const redisClient = await getSubscriber();
  if (!redisClient) {
    return false;
  }

  await redisClient.subscribe(REDIS_CHANNEL, (message) => {
    try {
      const payload = JSON.parse(message) as { userId?: string; notification?: unknown };
      handler(payload);
    } catch (error) {
      console.error('Failed to parse broker payload:', error);
    }
  });

  return true;
};

export const publishNotificationEvent = async (payload: unknown) => {
  try {
    const redisClient = await getPublisher();
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
