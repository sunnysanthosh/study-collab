import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import AddTopicPage from './add-topic/page';

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return {
    ...actual,
    topicApi: {
      createTopic: vi.fn().mockResolvedValue({ data: { id: '1' } }),
    },
    adminApi: {
      getStats: vi.fn().mockResolvedValue({ data: { stats: { totalUsers: 0, activeTopics: 0, pendingRequests: 0, onlineNow: 0 } } }),
      getUsers: vi.fn().mockResolvedValue({ data: { users: [] } }),
    },
  };
});

vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock('@/components/layout/Shell', () => ({
  Shell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

describe('AddTopicPage', () => {
  it('shows validation errors for empty fields', async () => {
    const { container } = render(<AddTopicPage />);
    const form = container.querySelector('form');

    if (!form) {
      throw new Error('Form not found');
    }

    fireEvent.submit(form);

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(await screen.findByText('Description is required')).toBeInTheDocument();
    expect(await screen.findByText('At least one tag is required')).toBeInTheDocument();
  });

  it('submits when valid', async () => {
    const user = userEvent.setup();
    const { container } = render(<AddTopicPage />);

    await user.type(screen.getByLabelText('Topic Title'), 'New Topic');
    await user.type(screen.getByLabelText('Description'), 'A valid description');
    await user.type(screen.getByLabelText('Tags (comma separated)'), 'Tag1');

    await waitFor(() => {
      expect(screen.getByLabelText('Topic Title')).toHaveValue('New Topic');
      expect(screen.getByLabelText('Description')).toHaveValue('A valid description');
      expect(screen.getByLabelText('Tags (comma separated)')).toHaveValue('Tag1');
    });

    const submitButtons = screen.getAllByRole('button', { name: 'Create Topic' });
    await user.click(submitButtons[0]);

    const { topicApi } = await import('@/lib/api');
    await waitFor(() => {
      expect(topicApi.createTopic).toHaveBeenCalled();
    });
  });
});
