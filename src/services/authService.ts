import { ApiResponse, AuthResponse, User, LoginForm, RegisterForm } from '../types';
import { apiClient } from './apiClient';

export const authService = {
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/login', { email, password });
  },

  async register(userData: RegisterForm): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>('/auth/register', userData);
  },

  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/auth/profile');
  },

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<null>> {
    return apiClient.put<null>('/auth/profile', userData);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    return apiClient.put<null>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  logout(): void {
    localStorage.removeItem('autofleet_token');
    localStorage.removeItem('autofleet_user');
  },
};

