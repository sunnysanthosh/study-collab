import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAdminStats,
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  getAdminTopics,
  deleteAdminTopic,
  getAdminActivityLogs,
} from '../src/controllers/adminController';

vi.mock('../src/db/connection', () => ({
  query: vi.fn(),
}));

vi.mock('../src/models/User', () => ({
  getUserById: vi.fn(),
  getUserByEmail: vi.fn(),
  adminUpdateUser: vi.fn(),
  deleteUser: vi.fn(),
  countUsersByRole: vi.fn(),
}));

vi.mock('../src/models/Topic', () => ({
  getTopicById: vi.fn(),
  getAdminTopicList: vi.fn(),
  deleteTopic: vi.fn(),
}));

vi.mock('../src/models/AdminActivityLog', () => ({
  createAdminLog: vi.fn().mockResolvedValue(undefined),
  getAdminActivityLogs: vi.fn(),
}));

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('adminController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns stats counts including totalMessages', async () => {
    const { query } = await import('../src/db/connection');
    (query as any)
      .mockResolvedValueOnce({ rows: [{ count: '5' }] })
      .mockResolvedValueOnce({ rows: [{ count: '2' }] })
      .mockResolvedValueOnce({ rows: [{ count: '3' }] })
      .mockResolvedValueOnce({ rows: [{ count: '10' }] });

    const req: any = {};
    const res = mockResponse();

    await getAdminStats(req, res);

    expect(res.json).toHaveBeenCalledWith({
      stats: {
        totalUsers: 5,
        activeTopics: 2,
        pendingRequests: 0,
        onlineNow: 3,
        totalMessages: 10,
      },
    });
  });

  it('returns paginated users', async () => {
    const { query } = await import('../src/db/connection');
    (query as any).mockResolvedValue({
      rows: [{ id: '1', name: 'Test', email: 't@t.com', role: 'user', created_at: new Date().toISOString() }],
    });

    const req: any = { query: { limit: '10', offset: '0' } };
    const res = mockResponse();

    await getAdminUsers(req, res);

    expect(res.json).toHaveBeenCalledWith({
      users: [{ id: '1', name: 'Test', email: 't@t.com', role: 'user', created_at: expect.any(String) }],
      limit: 10,
      offset: 0,
    });
  });

  it('updateAdminUser updates name, email, role', async () => {
    const User = await import('../src/models/User');
    (User.getUserById as any).mockResolvedValue({
      id: 'u2',
      name: 'Old',
      email: 'old@x.com',
      role: 'user',
    });
    (User.getUserByEmail as any).mockResolvedValue(null);
    (User.adminUpdateUser as any).mockResolvedValue({
      id: 'u2',
      name: 'New',
      email: 'new@x.com',
      role: 'admin',
    });

    const req: any = {
      params: { id: 'u2' },
      user: { userId: 'u1' },
      body: { name: 'New', email: 'new@x.com', role: 'admin' },
    };
    const res = mockResponse();

    await updateAdminUser(req, res);

    expect(res.json).toHaveBeenCalledWith({
      user: { id: 'u2', name: 'New', email: 'new@x.com', role: 'admin' },
    });
  });

  it('updateAdminUser rejects self-role change', async () => {
    const User = await import('../src/models/User');
    (User.getUserById as any).mockResolvedValue({ id: 'u1', name: 'Me', email: 'me@x.com', role: 'admin' });

    const req: any = {
      params: { id: 'u1' },
      user: { userId: 'u1' },
      body: { role: 'user' },
    };
    const res = mockResponse();

    await updateAdminUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cannot change your own role' });
  });

  it('deleteAdminUser deletes non-self user', async () => {
    const User = await import('../src/models/User');
    (User.getUserById as any).mockResolvedValue({ id: 'u2', role: 'user' });
    (User.countUsersByRole as any).mockResolvedValue(1);
    (User.deleteUser as any).mockResolvedValue(true);

    const req: any = { params: { id: 'u2' }, user: { userId: 'u1' } };
    const res = mockResponse();

    await deleteAdminUser(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: 'User deleted' });
  });

  it('deleteAdminUser rejects self-delete', async () => {
    const req: any = { params: { id: 'u1' }, user: { userId: 'u1' } };
    const res = mockResponse();

    await deleteAdminUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cannot delete your own account' });
  });

  it('getAdminTopics returns topic list', async () => {
    const Topic = await import('../src/models/Topic');
    (Topic.getAdminTopicList as any).mockResolvedValue([
      { id: 't1', title: 'Calc', created_at: new Date(), creator_name: 'Alice', member_count: '5', message_count: '12' },
    ]);

    const req: any = { query: { limit: '20', offset: '0' } };
    const res = mockResponse();

    await getAdminTopics(req, res);

    expect(res.json).toHaveBeenCalledWith({
      topics: [
        expect.objectContaining({ id: 't1', title: 'Calc', creator_name: 'Alice', member_count: '5', message_count: '12' }),
      ],
      limit: 20,
      offset: 0,
    });
  });

  it('deleteAdminTopic deletes topic', async () => {
    const Topic = await import('../src/models/Topic');
    (Topic.getTopicById as any).mockResolvedValue({ id: 't1', title: 'Calc' });
    (Topic.deleteTopic as any).mockResolvedValue(true);

    const req: any = { params: { id: 't1' }, user: { userId: 'u1' } };
    const res = mockResponse();

    await deleteAdminTopic(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: 'Topic deleted' });
  });

  it('getAdminActivityLogs returns paginated logs', async () => {
    const AdminLog = await import('../src/models/AdminActivityLog');
    (AdminLog.getAdminActivityLogs as any).mockResolvedValue([
      {
        id: 'log1',
        admin_user_id: 'u1',
        action: 'user_updated',
        target_type: 'user',
        target_id: 'u2',
        metadata: { name: 'Alice', email: 'a@x.com' },
        created_at: new Date().toISOString(),
        admin_name: 'Admin',
      },
    ]);

    const req: any = { query: { limit: '20', offset: '0' } };
    const res = mockResponse();

    await getAdminActivityLogs(req, res);

    expect(res.json).toHaveBeenCalledWith({
      logs: [
        expect.objectContaining({
          id: 'log1',
          action: 'user_updated',
          target_type: 'user',
          admin_name: 'Admin',
        }),
      ],
      limit: 20,
      offset: 0,
    });
  });
});
