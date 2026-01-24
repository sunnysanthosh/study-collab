import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProfile, updateProfile } from '../src/controllers/userController';

vi.mock('../src/models/User', () => ({
  getUserById: vi.fn(),
  getUserByEmail: vi.fn(),
  updateUser: vi.fn(),
}));

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('userController', () => {
  const userId = 'user-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns profile data for authenticated user', async () => {
    const { getUserById } = await import('../src/models/User');
    (getUserById as any).mockResolvedValue({
      id: userId,
      name: 'Test',
      email: 'test@example.com',
      avatar_url: null,
      role: 'user',
      created_at: new Date().toISOString(),
    });

    const req: any = { user: { userId } };
    const res = mockResponse();

    await getProfile(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      id: userId,
      name: 'Test',
      email: 'test@example.com',
    }));
  });

  it('updates profile when valid', async () => {
    const { getUserByEmail, updateUser } = await import('../src/models/User');
    (getUserByEmail as any).mockResolvedValue(null);
    (updateUser as any).mockResolvedValue({
      id: userId,
      name: 'Updated',
      email: 'updated@example.com',
      avatar_url: null,
      role: 'user',
    });

    const req: any = {
      user: { userId },
      body: { name: 'Updated', email: 'updated@example.com' },
    };
    const res = mockResponse();

    await updateProfile(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Profile updated successfully',
    }));
  });
});
