import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Auth from '../../src/pages/Auth';

// Mock the API service
vi.mock('../../src/services/api', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn()
}));

// Mock the auth hook
vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    isLoading: false
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

describe('Auth Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Form', () => {
    it('should render login form elements', () => {
      render(
        <TestWrapper>
          <Auth />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      render(
        <TestWrapper>
          <Auth />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      render(
        <TestWrapper>
          <Auth />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it('should validate password length', async () => {
      render(
        <TestWrapper>
          <Auth />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Registration Form', () => {
    it('should switch to registration mode', async () => {
      render(
        <TestWrapper>
          <Auth />
        </TestWrapper>
      );

      const switchToRegister = screen.getByText(/create account/i);
      fireEvent.click(switchToRegister);

      await waitFor(() => {
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      });
    });

    it('should validate username requirements', async () => {
      render(
        <TestWrapper>
          <Auth />
        </TestWrapper>
      );

      // Switch to registration
      const switchToRegister = screen.getByText(/create account/i);
      fireEvent.click(switchToRegister);

      await waitFor(() => {
        const usernameInput = screen.getByLabelText(/username/i);
        fireEvent.change(usernameInput, { target: { value: 'ab' } });
        fireEvent.blur(usernameInput);
      });

      await waitFor(() => {
        expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate password confirmation', async () => {
      render(
        <TestWrapper>
          <Auth />
        </TestWrapper>
      );

      // Switch to registration
      const switchToRegister = screen.getByText(/create account/i);
      fireEvent.click(switchToRegister);

      await waitFor(() => {
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
        fireEvent.blur(confirmPasswordInput);
      });

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should handle successful login', async () => {
      const mockLogin = vi.fn().mockResolvedValue({ success: true });
      
      vi.mocked(require('../../src/hooks/useAuth').useAuth).mockReturnValue({
        user: null,
        login: mockLogin,
        register: vi.fn(),
        logout: vi.fn(),
        isLoading: false
      });

      render(
        <TestWrapper>
          <Auth />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should handle login errors', async () => {
      const mockLogin = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
      
      vi.mocked(require('../../src/hooks/useAuth').useAuth).mockReturnValue({
        user: null,
        login: mockLogin,
        register: vi.fn(),
        logout: vi.fn(),
        isLoading: false
      });

      render(
        <TestWrapper>
          <Auth />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during authentication', () => {
      vi.mocked(require('../../src/hooks/useAuth').useAuth).mockReturnValue({
        user: null,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isLoading: true
      });

      render(
        <TestWrapper>
          <Auth />
        </TestWrapper>
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should disable form during submission', async () => {
      const mockLogin = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      vi.mocked(require('../../src/hooks/useAuth').useAuth).mockReturnValue({
        user: null,
        login: mockLogin,
        register: vi.fn(),
        logout: vi.fn(),
        isLoading: false
      });

      render(
        <TestWrapper>
          <Auth />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
    });
  });
});