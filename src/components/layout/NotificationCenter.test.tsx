import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationCenter } from './NotificationCenter';

const { mockGetNotifications, mockGetUnreadCount } = vi.hoisted(() => ({
  mockGetNotifications: vi.fn(),
  mockGetUnreadCount: vi.fn(),
}));

vi.mock('socket.io-client', () => ({
  io: () => ({
    on: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@studycollab.com',
    },
  }),
}));

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    api: {
      ...actual.api,
      getToken: () => 'token',
    },
    notificationApi: {
      getNotifications: mockGetNotifications,
      getUnreadCount: mockGetUnreadCount,
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      deleteNotification: vi.fn(),
    },
  };
});

describe('NotificationCenter', () => {
  beforeEach(() => {
    mockGetUnreadCount.mockResolvedValue({ data: { count: 2 } });
    mockGetNotifications.mockResolvedValue({
      data: {
        notifications: [
          {
            id: 'notif-1',
            title: 'New message in Calculus I',
            message: 'Hello there',
            link: '/topics/1',
            type: 'message',
            read: false,
            created_at: new Date().toISOString(),
          },
        ],
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads unread count and notifications', async () => {
    render(<NotificationCenter />);

    await waitFor(() => {
      expect(mockGetUnreadCount).toHaveBeenCalled();
      expect(mockGetNotifications).toHaveBeenCalled();
    });

    const bell = screen.getByRole('button', { name: /🔔/ });
    expect(bell).toBeInTheDocument();

    bell.click();
    expect(await screen.findByText('Notifications')).toBeInTheDocument();
    expect(await screen.findByText('New message in Calculus I')).toBeInTheDocument();
  });
});
