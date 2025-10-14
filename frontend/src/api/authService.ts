import apiClient from './apiClient';
import type { 
  LoginPayload, 
  RegisterPayload, 
  AuthResponse, 
  UserProfile
} from './types/auth';

class AuthServiceClass {
  // Add token management
  private getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  private handleError(error: any): Error {
  if (error.message === 'Network Error') {
    return new Error('Unable to connect to server. Please check your connection.');
  }

  if (error.response?.data?.message) {
    return new Error(error.response.data.message);
  }

  return new Error('An unexpected error occurred');
}


  async login(credentials: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw this.handleError(error);
    }
  }

  async register(userData: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

async checkAuth(): Promise<UserProfile | null> {
  try {
    const response = await apiClient.get('/auth/me', { withCredentials: true });
    return response.data || null;
  } catch (error) {
    console.error('Auth check failed:', error);
    return null;
  }
}


async logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout', {}, { withCredentials: true });
  } finally {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }
}

}

export const AuthService = new AuthServiceClass();