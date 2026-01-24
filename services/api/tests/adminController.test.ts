import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAdminStats, getAdminUsers } from '../src/controllers/adminController';

vi.mock('../src/db/connection', () => ({
  query: vi.fn(),
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

  it('returns stats counts', async () => {
    const { query } = await import('../src/db/connection');
    (query as any)
      .mockResolvedValueOnce({ rows: [{ count: '5' }] })
      .mockResolvedValueOnce({ rows: [{ count: '2' }] })
      .mockResolvedValueOnce({ rows: [{ count: '3' }] });

    const req: any = {};
    const res = mockResponse();

    await getAdminStats(req, res);

    expect(res.json).toHaveBeenCalledWith({
      stats: {
        totalUsers: 5,
        activeTopics: 2,
        pendingRequests: 0,
        onlineNow: 3,
      },
    });
  });

  it('returns paginated users', async () => {
    const { query } = await import('../src/db/connection');
    (query as any).mockResolvedValue({ rows: [{ id: '1', name: 'Test', email: 't@t.com', role: 'user', created_at: new Date().toISOString() }] });

    const req: any = { query: { limit: '10', offset: '0' } };
    const res = mockResponse();

    await getAdminUsers(req, res);

    expect(res.json).toHaveBeenCalledWith({
      users: [{ id: '1', name: 'Test', email: 't@t.com', role: 'user', created_at: expect.any(String) }],
      limit: 10,
      offset: 0,
    });
  });
});
