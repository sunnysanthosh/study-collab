import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login } from '../src/controllers/authController';

vi.mock('../src/models/User', () => ({
  verifyUserPassword: vi.fn(),
}));

vi.mock('../src/utils/jwt', () => ({
  generateAccessToken: vi.fn(() => 'access-token'),
  generateRefreshToken: vi.fn(() => 'refresh-token'),
}));

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('authController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns tokens on valid login', async () => {
    const { verifyUserPassword } = await import('../src/models/User');
    (verifyUserPassword as any).mockResolvedValue({
      id: 'user-1',
      name: 'User',
      email: 'user@example.com',
      role: 'user',
    });

    const req: any = { body: { email: 'user@example.com', password: 'Password1' } };
    const res = mockResponse();

    await login(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    }));
  });
});
