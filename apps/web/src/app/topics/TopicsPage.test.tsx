import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TopicsPage from './page';

const { mockGetTopics } = vi.hoisted(() => ({
  mockGetTopics: vi.fn(),
}));

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    topicApi: {
      ...actual.topicApi,
      getTopics: mockGetTopics,
      getFavorites: vi.fn(),
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
    },
    notificationApi: {
      getNotifications: vi.fn(),
      getUnreadCount: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      deleteNotification: vi.fn(),
    },
  };
});

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

describe('TopicsPage search filters', () => {
  beforeEach(() => {
    mockGetTopics.mockResolvedValue({ data: { topics: [] } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('serializes filters into getTopics calls', async () => {
    render(<TopicsPage />);

    await waitFor(() => {
      expect(mockGetTopics).toHaveBeenCalled();
    });
    mockGetTopics.mockClear();

    fireEvent.change(screen.getByPlaceholderText('Search topics...'), {
      target: { value: 'calculus' },
    });
    fireEvent.change(screen.getByLabelText('Sort by'), {
      target: { value: 'popularity' },
    });
    fireEvent.change(screen.getByLabelText('Created from'), {
      target: { value: '2026-01-01' },
    });
    fireEvent.change(screen.getByLabelText('Created to'), {
      target: { value: '2026-01-31' },
    });

    await new Promise((resolve) => setTimeout(resolve, 350));

    const matched = mockGetTopics.mock.calls.some(([call]) =>
      call.search === 'calculus' &&
      call.sort === 'popularity' &&
      call.createdFrom === '2026-01-01' &&
      call.createdTo === '2026-01-31'
    );
    expect(matched).toBe(true);
  });
});
