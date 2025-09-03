import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Generate from '../../src/pages/Generate';

// Mock the API service
vi.mock('../../src/services/api', () => ({
  generateAdventure: vi.fn(),
  getUserProfile: vi.fn()
}));

// Mock the auth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'user123',
      email: 'test@example.com',
      tier: 'creator',
      generations_used: 5,
      generation_limit: 15
    },
    isAuthenticated: true
  })
}));

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

describe('Adventure Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Generation Form', () => {
    it('should render all form fields', () => {
      render(
        <TestWrapper>
          <Generate />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/adventure title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/party level/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/party size/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/setting/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /generate adventure/i })).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      render(
        <TestWrapper>
          <Generate />
        </TestWrapper>
      );

      const generateButton = screen.getByRole('button', { name: /generate adventure/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/theme is required/i)).toBeInTheDocument();
      });
    });

    it('should validate party level range', async () => {
      render(
        <TestWrapper>
          <Generate />
        </TestWrapper>
      );

      const levelInput = screen.getByLabelText(/party level/i);
      fireEvent.change(levelInput, { target: { value: '25' } });
      fireEvent.blur(levelInput);

      await waitFor(() => {
        expect(screen.getByText(/level must be between 1 and 20/i)).toBeInTheDocument();
      });
    });

    it('should validate party size range', async () => {
      render(
        <TestWrapper>
          <Generate />
        </TestWrapper>
      );

      const sizeInput = screen.getByLabelText(/party size/i);
      fireEvent.change(sizeInput, { target: { value: '0' } });
      fireEvent.blur(sizeInput);

      await waitFor(() => {
        expect(screen.getByText(/party size must be between 1 and 8/i)).toBeInTheDocument();
      });
    });
  });

  describe('Theme Selection', () => {
    it('should provide theme options', () => {
      render(
        <TestWrapper>
          <Generate />
        </TestWrapper>
      );

      const themeSelect = screen.getByLabelText(/theme/i);
      fireEvent.click(themeSelect);

      expect(screen.getByText(/fantasy/i)).toBeInTheDocument();
      expect(screen.getByText(/sci-fi/i)).toBeInTheDocument();
      expect(screen.getByText(/horror/i)).toBeInTheDocument();
      expect(screen.getByText(/mystery/i)).toBeInTheDocument();
    });

    it('should update form when theme is selected', async () => {
      render(
        <TestWrapper>
          <Generate />
        </TestWrapper>
      );

      const themeSelect = screen.getByLabelText(/theme/i);
      fireEvent.change(themeSelect, { target: { value: 'fantasy' } });

      await waitFor(() => {
        expect(themeSelect).toHaveValue('fantasy');
      });
    });
  });

  describe('Setting Selection', () => {
    it('should provide setting options', () => {
      render(
        <TestWrapper>
          <Generate />
        </TestWrapper>
      );

      const settingSelect = screen.getByLabelText(/setting/i);
      fireEvent.click(settingSelect);

      expect(screen.getByText(/dungeon/i)).toBeInTheDocument();
      expect(screen.getByText(/wilderness/i)).toBeInTheDocument();
      expect(screen.getByText(/city/i)).toBeInTheDocument();
      expect(screen.getByText(/castle/i)).toBeInTheDocument();
    });
  });

  describe('Generation Limits', () => {
    it('should show generation usage', () => {
      render(
        <TestWrapper>
          <Generate />
        </TestWrapper>
      );

      expect(screen.getByText(/5 of 15 generations used/i)).toBeInTheDocument();
    });

    it('should disable generation when limit reached', () => {
      vi.mocked(require('../../src/hooks/useAuth').useAuth).mockReturnValue({
        user: {
          id: 'user123',
          email: 'test@example.com',
          tier: 'creator',
          generations_used: 15,
          generation_limit: 15
        },
        isAuthenticated: true
      });

      render(
        <TestWrapper>
          <Generate />
        </TestWrapper>
      );

      const generateButton = screen.getByRole('button', { name: /generate adventure/i });
      expect(generateButton).toBeDisabled();
      expect(screen.getByText(/generation limit reached/i)).toBeInTheDocument();
    });
  });

  describe('Adventure Generation Process', () => {
    it('should handle successful generation', async () => {
      const mockGenerateAdventure = vi.fn().mockResolvedValue({
        id: 'adventure123',
        title: 'Test Adventure',
        content: {
          introduction: 'Welcome to the test adventure',
          encounters: []
        }
      });

      vi.mocked(require('../../src/services/api').generateAdventure).mockImplementation(mockGenerateAdventure);

      render(
        <TestWrapper>
          <Generate />
        </TestWrapper>
      );

      // Fill form
      fireEvent.change(screen.getByLabelText(/adventure title/i), { target: { value: 'Test Adventure' } });
      fireEvent.change(screen.getByLabelText(/theme/i), { target: { value: 'fantasy' } });
      fireEvent.change(screen.getByLabelText(/party level/i), { target: { value: '5' } });
      fireEvent.change(screen.getByLabelText(/party size/i), { target: { value: '4' } });
      fireEvent.change(screen.getByLabelText(/setting/i), { target: { value: 'dungeon' } });

      // Submit form
      const generateButton = screen.getByRole('button', { name: /generate adventure/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockGenerateAdventure).toHaveBeenCalledWith({
          title: 'Test Adventure',
          theme: 'fantasy',
          level: 5,
          partySize: 4,
          setting: 'dungeon'
        });
      });
    });

    it('should show loading state during generation', async () => {
      const mockGenerateAdventure = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      vi.mocked(require('../../src/services/api').generateAdventure).mockImplementation(mockGenerateAdventure);

      render(
        <TestWrapper>
          <Generate />
        </TestWrapper>
      );

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/adventure title/i), { target: { value: 'Test Adventure' } });
      fireEvent.change(screen.getByLabelText(/theme/i), { target: { value: 'fantasy' } });
      
      const generateButton = screen.getByRole('button', { name: /generate adventure/i });
      fireEvent.click(generateButton);

      expect(screen.getByText(/generating adventure/i)).toBeInTheDocument();
      expect(generateButton).toBeDisabled();
    });

    it('should handle generation errors', async () => {
      const mockGenerateAdventure = vi.fn().mockRejectedValue(new Error('Generation failed'));

      vi.mocked(require('../../src/services/api').generateAdventure).mockImplementation(mockGenerateAdventure);

      render(
        <TestWrapper>
          <Generate />
        </TestWrapper>
      );

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/adventure title/i), { target: { value: 'Test Adventure' } });
      fireEvent.change(screen.getByLabelText(/theme/i), { target: { value: 'fantasy' } });
      
      const generateButton = screen.getByRole('button', { name: /generate adventure/i });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/generation failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Advanced Options', () => {
    it('should show advanced options when expanded', async () => {
      render(
        <TestWrapper>
          <Generate />
        </TestWrapper>
      );

      const advancedToggle = screen.getByText(/advanced options/i);
      fireEvent.click(advancedToggle);

      await waitFor(() => {
        expect(screen.getByLabelText(/tone/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/complexity/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/include npcs/i)).toBeInTheDocument();
      });
    });

    it('should validate tone selection', async () => {
      render(
        <TestWrapper>
          <Generate />
        </TestWrapper>
      );

      const advancedToggle = screen.getByText(/advanced options/i);
      fireEvent.click(advancedToggle);

      await waitFor(() => {
        const toneSelect = screen.getByLabelText(/tone/i);
        fireEvent.change(toneSelect, { target: { value: 'serious' } });
        expect(toneSelect).toHaveValue('serious');
      });
    });
  });

  describe('Privacy Settings', () => {
    it('should allow setting adventure privacy', async () => {
      render(
        <TestWrapper>
          <Generate />
        </TestWrapper>
      );

      const privacySelect = screen.getByLabelText(/privacy/i);
      fireEvent.change(privacySelect, { target: { value: 'private' } });

      await waitFor(() => {
        expect(privacySelect).toHaveValue('private');
      });
    });

    it('should warn about private slot usage', async () => {
      vi.mocked(require('../../src/hooks/useAuth').useAuth).mockReturnValue({
        user: {
          id: 'user123',
          email: 'test@example.com',
          tier: 'creator',
          private_slots_used: 2,
          private_adventure_limit: 3
        },
        isAuthenticated: true
      });

      render(
        <TestWrapper>
          <Generate />
        </TestWrapper>
      );

      const privacySelect = screen.getByLabelText(/privacy/i);
      fireEvent.change(privacySelect, { target: { value: 'private' } });

      await waitFor(() => {
        expect(screen.getByText(/2 of 3 private slots used/i)).toBeInTheDocument();
      });
    });
  });
});