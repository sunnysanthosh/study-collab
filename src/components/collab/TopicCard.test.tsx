import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TopicCard } from './TopicCard';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('TopicCard', () => {
  it('renders title, description, and tags', () => {
    render(
      <TopicCard
        id="topic-1"
        title="Calculus I"
        description="Limits and derivatives"
        tags={['Math', 'Calculus']}
      />
    );

    expect(screen.getByText('Calculus I')).toBeInTheDocument();
    expect(screen.getByText('Limits and derivatives')).toBeInTheDocument();
    expect(screen.getByText('#Math')).toBeInTheDocument();
    expect(screen.getByText('#Calculus')).toBeInTheDocument();
  });

  it('toggles favorite when star is clicked', () => {
    const onToggleFavorite = vi.fn();

    render(
      <TopicCard
        id="topic-1"
        title="Calculus I"
        description="Limits and derivatives"
        tags={['Math']}
        isFavorite={false}
        onToggleFavorite={onToggleFavorite}
      />
    );

    fireEvent.click(screen.getByLabelText('Add favorite'));
    expect(onToggleFavorite).toHaveBeenCalledWith('topic-1');
  });
});
