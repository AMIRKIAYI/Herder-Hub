import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthService } from '../api/authService';
import type { UserProfile, LoginPayload, RegisterPayload } from '../api/types/auth';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (userData: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>(null!);

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 3000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }, []);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const user = await AuthService.checkAuth();
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        setRetryCount(0);
        return true;
      }
      clearAuthState();
      return false;
    } catch (error) {
      console.error('Authentication check error:', error);
      clearAuthState();
      
      if (retryCount < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        setRetryCount(prev => prev + 1);
        return checkAuth();
      }
      
      toast.error('Unable to verify authentication status');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [retryCount, clearAuthState]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

const login = async (credentials: LoginPayload) => {
  setIsLoading(true);
  try {
    await AuthService.login(credentials);

    // After login, fetch the user's profile
    const profile = await AuthService.checkAuth();
    if (profile) {
      setUser(profile);
      setIsAuthenticated(true);
      setRetryCount(0);
      toast.success('Login successful');
    } else {
      clearAuthState();
      toast.error('Failed to fetch user profile');
    }

    // If you still want to store a token from the response, handle it here
    const storage = credentials.rememberMe ? localStorage : sessionStorage;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) storage.setItem('token', token);

  } catch (error: any) {
    clearAuthState();
    toast.error(error._error || 'Login failed');
    throw error;
  } finally {
    setIsLoading(false);
  }
};


  const register = async (userData: RegisterPayload) => {
    setIsLoading(true);
    try {
      const { token, user } = await AuthService.register(userData);
      localStorage.setItem('token', token);
      setUser(user);
      setIsAuthenticated(true);
      setRetryCount(0);
      toast.success('Registration successful');
    } catch (error: any) {
      clearAuthState();
      toast.error(error._error || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    } finally {
      clearAuthState();
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};