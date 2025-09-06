import { useState, useEffect, createContext, useContext } from 'react';
import * as api from '../services/api';

interface User {
  id: string;
  email: string;
  username: string;
  tier: string;
  generations_used?: number;
  generation_limit?: number;
  private_slots_used?: number;
  private_adventure_limit?: number;
}

interface AuthContextType {
  user: User | null;
  profile: User | null; // Alias for user for backward compatibility
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  const isAuthenticated = !!user;

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      loadUser();
    } else {
      setIsLoading(false); // No token, stop loading
    }
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const userData = await api.getUserProfile();
      setUser(userData);
    } catch (error) {
      console.log('Failed to load user, clearing token:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login(email, password);
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.register(email, username, password);
      localStorage.setItem('auth_token', response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile: user, // Alias for user for backward compatibility
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      signOut: logout // Alias for backward compatibility
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};