import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationModel } from '../src/models/Notification';

vi.mock('../src/db/connection', () => ({
  default: {
    query: vi.fn(),
  },
}));

vi.mock('../src/utils/redis', () => ({
  publishNotificationEvent: vi.fn().mockResolvedValue(true),
}));

describe('Notification model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates notification and attempts notify', async () => {
    const pool = (await import('../src/db/connection')).default as any;
    const { publishNotificationEvent } = await import('../src/utils/redis');
    pool.query.mockResolvedValueOnce({ rows: [{ id: 'n1', user_id: 'u1' }] });
    pool.query.mockResolvedValueOnce({});

    const result = await NotificationModel.create({
      user_id: 'u1',
      type: 'message',
      title: 'New message',
      message: 'Hello',
      link: '/topics/t1',
    });

    expect(result.id).toBe('n1');
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO notifications'),
      ['u1', 'message', 'New message', 'Hello', '/topics/t1']
    );
    expect(publishNotificationEvent).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1' })
    );
  });

  it('gets notifications and unread count', async () => {
    const pool = (await import('../src/db/connection')).default as any;
    pool.query.mockResolvedValueOnce({ rows: [{ id: 'n1' }] });
    pool.query.mockResolvedValueOnce({ rows: [{ count: '2' }] });

    const notifications = await NotificationModel.getUserNotifications('u1', 10, 0);
    const count = await NotificationModel.getUnreadCount('u1');

    expect(notifications).toHaveLength(1);
    expect(count).toBe(2);
  });

  it('updates and deletes notifications', async () => {
    const pool = (await import('../src/db/connection')).default as any;

    await NotificationModel.markAsRead('n1', 'u1');
    await NotificationModel.markAllAsRead('u1');
    await NotificationModel.delete('n1', 'u1');

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE notifications'),
      ['n1', 'u1']
    );
  });
});
