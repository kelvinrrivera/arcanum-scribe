import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Gallery from '../../src/pages/Gallery';

// Mock the API service
vi.mock('../../src/services/api', () => ({
  getPublicAdventures: vi.fn(),
  searchAdventures: vi.fn(),
  rateAdventure: vi.fn()
}));

// Mock the auth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user123',
      email: 'test@example.com',
      tier: 'creator'
    },
    isAuthenticated: true
  })
}));

const mockAdventures = [
  {
    id: 'adventure1',
    title: 'Dragon\'s Lair',
    description: 'Face the ancient red dragon',
    game_system: 'D&D 5e',
    level_range: [8, 10],
    rating: 4.5,
    rating_count: 12,
    views: 150,
    created_at: '2024-01-15T10:00:00Z',
    user: {
      username: 'dragonmaster'
    }
  },
  {
    id: 'adventure2',
    title: 'Haunted Mansion',
    description: 'Investigate the mysterious mansion',
    game_system: 'Call of Cthulhu',
    level_range: [3, 5],
    rating: 4.2,
    rating_count: 8,
    views: 89,
    created_at: '2024-01-10T14:30:00Z',
    user: {
      username: 'horrormaster'
    }
  }
];

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Gallery Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(require('../../src/services/api').getPublicAdventures).mockResolvedValue(mockAdventures);
  });

  describe('Adventure Grid', () => {
    it('should render adventure cards', async () => {
      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Dragon\'s Lair')).toBeInTheDocument();
        expect(screen.getByText('Haunted Mansion')).toBeInTheDocument();
      });
    });

    it('should display adventure metadata', async () => {
      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('D&D 5e')).toBeInTheDocument();
        expect(screen.getByText('Call of Cthulhu')).toBeInTheDocument();
        expect(screen.getByText('Levels 8-10')).toBeInTheDocument();
        expect(screen.getByText('Levels 3-5')).toBeInTheDocument();
      });
    });

    it('should show ratings and view counts', async () => {
      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('4.5')).toBeInTheDocument();
        expect(screen.getByText('(12 ratings)')).toBeInTheDocument();
        expect(screen.getByText('150 views')).toBeInTheDocument();
      });
    });

    it('should display creator usernames', async () => {
      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('by dragonmaster')).toBeInTheDocument();
        expect(screen.getByText('by horrormaster')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText(/search adventures/i)).toBeInTheDocument();
    });

    it('should perform search on input', async () => {
      const mockSearchAdventures = vi.fn().mockResolvedValue([mockAdventures[0]]);
      vi.mocked(require('../../src/services/api').searchAdventures).mockImplementation(mockSearchAdventures);

      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search adventures/i);
      fireEvent.change(searchInput, { target: { value: 'dragon' } });

      await waitFor(() => {
        expect(mockSearchAdventures).toHaveBeenCalledWith('dragon');
      });
    });

    it('should show search results', async () => {
      const mockSearchAdventures = vi.fn().mockResolvedValue([mockAdventures[0]]);
      vi.mocked(require('../../src/services/api').searchAdventures).mockImplementation(mockSearchAdventures);

      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search adventures/i);
      fireEvent.change(searchInput, { target: { value: 'dragon' } });

      await waitFor(() => {
        expect(screen.getByText('Dragon\'s Lair')).toBeInTheDocument();
        expect(screen.queryByText('Haunted Mansion')).not.toBeInTheDocument();
      });
    });

    it('should show no results message', async () => {
      const mockSearchAdventures = vi.fn().mockResolvedValue([]);
      vi.mocked(require('../../src/services/api').searchAdventures).mockImplementation(mockSearchAdventures);

      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search adventures/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText(/no adventures found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should render filter options', () => {
      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/game system/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/level range/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
    });

    it('should filter by game system', async () => {
      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      const gameSystemFilter = screen.getByLabelText(/game system/i);
      fireEvent.change(gameSystemFilter, { target: { value: 'D&D 5e' } });

      await waitFor(() => {
        expect(screen.getByText('Dragon\'s Lair')).toBeInTheDocument();
        expect(screen.queryByText('Haunted Mansion')).not.toBeInTheDocument();
      });
    });

    it('should filter by level range', async () => {
      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      const levelFilter = screen.getByLabelText(/level range/i);
      fireEvent.change(levelFilter, { target: { value: '8-10' } });

      await waitFor(() => {
        expect(screen.getByText('Dragon\'s Lair')).toBeInTheDocument();
        expect(screen.queryByText('Haunted Mansion')).not.toBeInTheDocument();
      });
    });
  });

  describe('Sorting', () => {
    it('should sort by newest', async () => {
      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      const sortSelect = screen.getByLabelText(/sort by/i);
      fireEvent.change(sortSelect, { target: { value: 'newest' } });

      await waitFor(() => {
        const adventureCards = screen.getAllByTestId('adventure-card');
        expect(adventureCards[0]).toHaveTextContent('Dragon\'s Lair'); // Newer adventure first
      });
    });

    it('should sort by rating', async () => {
      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      const sortSelect = screen.getByLabelText(/sort by/i);
      fireEvent.change(sortSelect, { target: { value: 'rating' } });

      await waitFor(() => {
        const adventureCards = screen.getAllByTestId('adventure-card');
        expect(adventureCards[0]).toHaveTextContent('Dragon\'s Lair'); // Higher rated first
      });
    });

    it('should sort by popularity', async () => {
      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      const sortSelect = screen.getByLabelText(/sort by/i);
      fireEvent.change(sortSelect, { target: { value: 'popular' } });

      await waitFor(() => {
        const adventureCards = screen.getAllByTestId('adventure-card');
        expect(adventureCards[0]).toHaveTextContent('Dragon\'s Lair'); // More views first
      });
    });
  });

  describe('Adventure Rating', () => {
    it('should allow rating adventures', async () => {
      const mockRateAdventure = vi.fn().mockResolvedValue({ success: true });
      vi.mocked(require('../../src/services/api').rateAdventure).mockImplementation(mockRateAdventure);

      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      await waitFor(() => {
        const ratingStars = screen.getAllByTestId('rating-star');
        fireEvent.click(ratingStars[4]); // Click 5th star for 5-star rating
      });

      await waitFor(() => {
        expect(mockRateAdventure).toHaveBeenCalledWith('adventure1', 5);
      });
    });

    it('should show user\'s existing rating', async () => {
      const adventuresWithUserRating = mockAdventures.map(adventure => ({
        ...adventure,
        user_rating: adventure.id === 'adventure1' ? 4 : null
      }));

      vi.mocked(require('../../src/services/api').getPublicAdventures).mockResolvedValue(adventuresWithUserRating);

      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      await waitFor(() => {
        const filledStars = screen.getAllByTestId('filled-star');
        expect(filledStars).toHaveLength(4); // 4 stars filled for user's rating
      });
    });
  });

  describe('Pagination', () => {
    it('should show pagination controls', async () => {
      const manyAdventures = Array.from({ length: 25 }, (_, i) => ({
        ...mockAdventures[0],
        id: `adventure${i}`,
        title: `Adventure ${i}`
      }));

      vi.mocked(require('../../src/services/api').getPublicAdventures).mockResolvedValue(manyAdventures);

      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/page 1 of/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
      });
    });

    it('should navigate between pages', async () => {
      const manyAdventures = Array.from({ length: 25 }, (_, i) => ({
        ...mockAdventures[0],
        id: `adventure${i}`,
        title: `Adventure ${i}`
      }));

      vi.mocked(require('../../src/services/api').getPublicAdventures).mockResolvedValue(manyAdventures);

      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /next page/i });
        fireEvent.click(nextButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/page 2 of/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner', () => {
      vi.mocked(require('../../src/services/api').getPublicAdventures).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should show error message on failure', async () => {
      vi.mocked(require('../../src/services/api').getPublicAdventures).mockRejectedValue(
        new Error('Failed to load adventures')
      );

      render(
        <TestWrapper>
          <Gallery />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/failed to load adventures/i)).toBeInTheDocument();
      });
    });
  });
});