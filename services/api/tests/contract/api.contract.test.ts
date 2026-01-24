import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

vi.mock('../../src/models/User', () => ({
  verifyUserPassword: vi.fn().mockResolvedValue({
    id: 'u1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    avatar_url: null,
  }),
}));

vi.mock('../../src/utils/jwt', () => ({
  generateAccessToken: vi.fn(() => 'access-token'),
  generateRefreshToken: vi.fn(() => 'refresh-token'),
  verifyRefreshToken: vi.fn(() => ({
    userId: 'u1',
    email: 'test@example.com',
    role: 'user',
  })),
}));

import app from '../../src/app';

describe('api contract', () => {
  it('returns health payload shape', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
    });
  });

  it('returns login payload shape', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Password1' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Login successful',
      user: {
        id: 'u1',
        name: 'Test User',
        email: 'test@example.com',
        avatar_url: null,
        role: 'user',
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });
});
