import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the api and toast modules to avoid network calls
vi.mock('../utils/api', () => ({
  api: {
    post: vi.fn().mockResolvedValue({
      match_score: 85,
      match_rationale: 'Strong React and TypeScript skills.',
      missing_skills: ['GraphQL'],
      matched_skills: ['React', 'TypeScript'],
      cover_letter: 'Dear Hiring Manager...',
      top_skills_to_highlight: ['React'],
      pre_fill_data: { first_name: 'John', last_name: 'Doe', email: 'john@example.com', summary: '', skills: '' },
      credits_remaining: 2,
    }),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { ApplyWithAIBtn } from '../components/ApplyWithAIBtn';

const mockJob = {
  id: 1,
  title: 'Senior React Developer',
  company: 'Acme Corp',
  description: 'Build scalable frontend apps.',
  required_skills: ['React', 'TypeScript'],
  apply_url: 'https://example.com/apply',
};

describe('ApplyWithAIBtn', () => {
  it('renders the button with credits badge for free users', () => {
    render(
      <ApplyWithAIBtn
        job={mockJob as any}
        creditsRemaining={3}
        isPremium={false}
      />
    );
    expect(screen.getByText(/apply with ai/i)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows no credits badge for premium users', () => {
    render(
      <ApplyWithAIBtn
        job={mockJob as any}
        creditsRemaining={0}
        isPremium={true}
      />
    );
    expect(screen.getByText(/apply with ai/i)).toBeInTheDocument();
    // no credit badge
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows upgrade modal when free user has no credits', async () => {
    const user = userEvent.setup();
    render(
      <ApplyWithAIBtn
        job={mockJob as any}
        creditsRemaining={0}
        isPremium={false}
      />
    );
    await user.click(screen.getByText(/apply with ai/i));
    expect(screen.getByText(/upgrade to premium/i)).toBeInTheDocument();
  });
});
