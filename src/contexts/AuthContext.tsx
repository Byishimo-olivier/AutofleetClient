import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on app load
    const storedToken = localStorage.getItem('autofleet_token');
    const storedUser = localStorage.getItem('autofleet_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify token is still valid
        authService.getProfile()
          .then((response) => {
            if (response.success && response.data) {
              setUser(response.data);
            } else {
              // Token is invalid, clear storage
              localStorage.removeItem('autofleet_token');
              localStorage.removeItem('autofleet_user');
              setToken(null);
              setUser(null);
            }
          })
          .catch((err) => {
            console.error('Failed to verify session:', err);
            // Only clear storage if it's explicitly a 401/unauthorized error
            // (Assumes authService.getProfile check matches this)
            if (err.status === 401) {
              localStorage.removeItem('autofleet_token');
              localStorage.removeItem('autofleet_user');
              setToken(null);
              setUser(null);
            }
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('autofleet_token');
        localStorage.removeItem('autofleet_user');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);

      if (response.success && response.user && response.token) {
        setUser(response.user);
        setToken(response.token);

        // Store in localStorage
        localStorage.setItem('autofleet_token', response.token);
        localStorage.setItem('autofleet_user', JSON.stringify(response.user));
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.register(userData);

      if (response.success && response.data) {
        const { user: newUser, token: userToken } = response.data;
        setUser(newUser);
        setToken(userToken);

        // Store in localStorage
        localStorage.setItem('autofleet_token', userToken);
        localStorage.setItem('autofleet_user', JSON.stringify(newUser));
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('autofleet_token');
    localStorage.removeItem('autofleet_user');
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      const response = await authService.updateProfile(userData);

      if (response.success) {
        // Fetch updated profile
        const profileResponse = await authService.getProfile();
        if (profileResponse.success && profileResponse.data) {
          setUser(profileResponse.data);
          localStorage.setItem('autofleet_user', JSON.stringify(profileResponse.data));
        }
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const isAuthenticated = !!user && !!token;

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    if (role === 'admin') return user.role === 'admin';
    if (role === 'owner') return user.role === 'owner' || user.role === 'admin';
    return true; // All authenticated users can access customer features
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

