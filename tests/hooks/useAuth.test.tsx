import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAuth, AuthProvider } from '../../src/hooks/useAuth';

// Mock the API service
vi.mock('../../src/services/api', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getUserProfile: vi.fn()
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Initial State', () => {
    it('should initialize with no user when no token exists', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should initialize with user when valid token exists', async () => {
      const mockToken = 'valid_jwt_token';
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        tier: 'creator'
      };

      localStorageMock.getItem.mockReturnValue(mockToken);
      vi.mocked(require('../../src/services/api').getUserProfile).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
      });
    });
  });

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockLoginResponse = {
        token: 'new_jwt_token',
        user: {
          id: 'user123',
          email: 'test@example.com',
          username: 'testuser',
          tier: 'creator'
        }
      };

      vi.mocked(require('../../src/services/api').login).mockResolvedValue(mockLoginResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockLoginResponse.user);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new_jwt_token');
    });

    it('should handle login errors', async () => {
      vi.mocked(require('../../src/services/api').login).mockRejectedValue(
        new Error('Invalid credentials')
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'wrongpassword');
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should set loading state during login', async () => {
      vi.mocked(require('../../src/services/api').login).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.login('test@example.com', 'password123');
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Registration', () => {
    it('should register successfully with valid data', async () => {
      const mockRegisterResponse = {
        token: 'new_jwt_token',
        user: {
          id: 'user123',
          email: 'newuser@example.com',
          username: 'newuser',
          tier: 'explorer'
        }
      };

      vi.mocked(require('../../src/services/api').register).mockResolvedValue(mockRegisterResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.register('newuser@example.com', 'newuser', 'password123');
      });

      expect(result.current.user).toEqual(mockRegisterResponse.user);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new_jwt_token');
    });

    it('should handle registration errors', async () => {
      vi.mocked(require('../../src/services/api').register).mockRejectedValue(
        new Error('Email already exists')
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await expect(
        act(async () => {
          await result.current.register('existing@example.com', 'user', 'password123');
        })
      ).rejects.toThrow('Email already exists');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      // Set up authenticated user
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        tier: 'creator'
      };

      localStorageMock.getItem.mockReturnValue('valid_token');
      vi.mocked(require('../../src/services/api').getUserProfile).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });

    it('should handle logout API call', async () => {
      vi.mocked(require('../../src/services/api').logout).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(require('../../src/services/api').logout).toHaveBeenCalled();
    });
  });

  describe('Token Management', () => {
    it('should handle expired tokens', async () => {
      const expiredToken = 'expired_jwt_token';
      localStorageMock.getItem.mockReturnValue(expiredToken);
      vi.mocked(require('../../src/services/api').getUserProfile).mockRejectedValue(
        new Error('Token expired')
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      });
    });

    it('should refresh user data when token is valid', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        tier: 'creator',
        generations_used: 5,
        generation_limit: 15
      };

      localStorageMock.getItem.mockReturnValue('valid_token');
      vi.mocked(require('../../src/services/api').getUserProfile).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
      });
    });
  });

  describe('User Profile Updates', () => {
    it('should update user data after tier change', async () => {
      const initialUser = {
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        tier: 'explorer'
      };

      const updatedUser = {
        ...initialUser,
        tier: 'creator',
        generation_limit: 15
      };

      localStorageMock.getItem.mockReturnValue('valid_token');
      vi.mocked(require('../../src/services/api').getUserProfile)
        .mockResolvedValueOnce(initialUser)
        .mockResolvedValueOnce(updatedUser);

      const { result, rerender } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.user?.tier).toBe('explorer');
      });

      // Simulate tier upgrade
      rerender();

      await waitFor(() => {
        expect(result.current.user?.tier).toBe('creator');
        expect(result.current.user?.generation_limit).toBe(15);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      vi.mocked(require('../../src/services/api').login).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'password123');
        })
      ).rejects.toThrow('Network error');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle malformed API responses', async () => {
      vi.mocked(require('../../src/services/api').login).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'password123');
        })
      ).rejects.toThrow();
    });
  });
});