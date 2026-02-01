import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminDashboard from './page';

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return {
    ...actual,
    adminApi: {
      getStats: vi.fn().mockResolvedValue({
        data: { stats: { totalUsers: 2, activeTopics: 1, pendingRequests: 0, onlineNow: 1, totalMessages: 5 } },
      }),
      getUsers: vi.fn().mockResolvedValue({
        data: { users: [{ id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin', created_at: new Date().toISOString() }] },
      }),
      getTopics: vi.fn().mockResolvedValue({ data: { topics: [] } }),
      getHealth: vi.fn().mockResolvedValue({ data: { status: 'ok', timestamp: new Date().toISOString() } }),
      getActivityLogs: vi.fn().mockResolvedValue({ data: { logs: [] } }),
      getReports: vi.fn().mockResolvedValue({ data: { reports: [] } }),
      getAnalytics: vi.fn().mockResolvedValue({
        data: {
          analytics: {
            usersByDay: [{ date: '2026-01-01', count: 1 }],
            topicsByDay: [{ date: '2026-01-01', count: 1 }],
            messagesByDay: [{ date: '2026-01-01', count: 5 }],
            days: 7,
          },
        },
      }),
      resolveReport: vi.fn(),
      deleteMessage: vi.fn(),
      hideMessage: vi.fn(),
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      deleteTopic: vi.fn(),
    },
  };
});

vi.mock('@/contexts/ToastContext', () => {
  const showToast = vi.fn();
  return { useToast: () => ({ showToast }) };
});

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'admin-1', name: 'Admin', email: 'admin@example.com' } }),
}));

vi.mock('@/components/layout/Shell', () => ({
  Shell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('recharts', () => ({
  BarChart: () => <div data-testid="bar-chart">Analytics Chart</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
}));

describe('AdminDashboard', () => {
  it('renders stats, users, and system health from API', async () => {
    render(<AdminDashboard />);

    expect(await screen.findByText('Total Users')).toBeInTheDocument();
    expect(await screen.findByText('Total Messages')).toBeInTheDocument();
    expect(await screen.findByText('System Health')).toBeInTheDocument();
    expect(await screen.findByText('admin@example.com')).toBeInTheDocument();
    expect(await screen.findByText('Topics')).toBeInTheDocument();
    expect(await screen.findByText('Content reports')).toBeInTheDocument();
    expect(await screen.findByText('Analytics')).toBeInTheDocument();
    expect(await screen.findByText('Activity logs')).toBeInTheDocument();
  });
});
