import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminDashboard from './page';

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return {
    ...actual,
    adminApi: {
      getStats: vi.fn().mockResolvedValue({
        data: { stats: { totalUsers: 2, activeTopics: 1, pendingRequests: 0, onlineNow: 1 } },
      }),
      getUsers: vi.fn().mockResolvedValue({
        data: { users: [{ id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin', created_at: new Date().toISOString() }] },
      }),
    },
  };
});

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock('@/components/layout/Shell', () => ({
  Shell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('AdminDashboard', () => {
  it('renders stats and users from API', async () => {
    render(<AdminDashboard />);

    expect(await screen.findByText('Total Users')).toBeInTheDocument();
    expect(await screen.findByText('Admin')).toBeInTheDocument();
    expect(await screen.findByText('admin@example.com')).toBeInTheDocument();
  });
});
