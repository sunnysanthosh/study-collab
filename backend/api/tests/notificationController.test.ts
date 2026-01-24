import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../src/controllers/notificationController';

vi.mock('../src/models/Notification', () => ({
  NotificationModel: {
    getUserNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../src/utils/logger', () => ({
  logError: vi.fn(),
}));

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('notificationController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires auth to fetch notifications', async () => {
    const res = mockResponse();
    await getNotifications({ query: {} } as any, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns notifications for user', async () => {
    const { NotificationModel } = await import('../src/models/Notification');
    (NotificationModel.getUserNotifications as any).mockResolvedValue([{ id: 'n1' }]);

    const req: any = { user: { userId: 'u1' }, query: { limit: '10', offset: '0' } };
    const res = mockResponse();

    await getNotifications(req, res);

    expect(res.json).toHaveBeenCalledWith({ notifications: [{ id: 'n1' }] });
  });

  it('returns unread count', async () => {
    const { NotificationModel } = await import('../src/models/Notification');
    (NotificationModel.getUnreadCount as any).mockResolvedValue(3);

    const req: any = { user: { userId: 'u1' } };
    const res = mockResponse();

    await getUnreadCount(req, res);

    expect(res.json).toHaveBeenCalledWith({ count: 3 });
  });

  it('marks notifications as read and deleted', async () => {
    const req: any = { user: { userId: 'u1' }, params: { notificationId: 'n1' } };
    const res = mockResponse();

    await markAsRead(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Notification marked as read' });

    const resAll = mockResponse();
    await markAllAsRead({ user: { userId: 'u1' } } as any, resAll);
    expect(resAll.json).toHaveBeenCalledWith({ message: 'All notifications marked as read' });

    const resDelete = mockResponse();
    await deleteNotification(req, resDelete);
    expect(resDelete.json).toHaveBeenCalledWith({ message: 'Notification deleted' });
  });
});
