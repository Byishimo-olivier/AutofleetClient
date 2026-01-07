import { ApiResponse, AuthResponse, User, LoginForm, RegisterForm } from '../types';
import { apiClient } from './apiClient';

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export const authService = {
  // Login user
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Trigger storage event for navbar updates
        window.dispatchEvent(new Event('storage'));
        
        return {
          success: true,
          user: user,
          token: token
        };
      }
      
      return {
        success: false,
        message: response.message || 'Login failed'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Network error'
      };
    }
  },

  // Register new user
  async register(userData: RegisterForm): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      
      if (response.success && response.data) {
        // Store token and user data consistently
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Registration successful, token stored');
      }
      
      return {
        ...response,
        message: response.message ?? '',
      };
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  },

  // Get current user profile
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get<User>('/auth/profile');
      
      if (response.success && response.data) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.data));
        console.log('✅ Profile fetched and updated in storage');
      }
      
      return {
        ...response,
        message: response.message ?? '',
      };
    } catch (error) {
      console.error('❌ Failed to fetch profile:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.put<null>('/auth/profile', userData);
      
      if (response.success) {
        // Refresh profile data after successful update
        await this.getProfile();
        console.log('✅ Profile updated successfully');
      }
      
      return {
        ...response,
        message: response.message ?? '',
      };
    } catch (error) {
      console.error('❌ Failed to update profile:', error);
      throw error;
    }
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.put<null>('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      
      if (response.success) {
        console.log('✅ Password changed successfully');
      }
      
      return {
        ...response,
        message: response.message ?? '',
      };
    } catch (error) {
      console.error('❌ Failed to change password:', error);
      throw error;
    }
  },

  // Request password reset
  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<null>('/auth/forgot-password', { email });
      
      if (response.success) {
        console.log('✅ Password reset email sent');
      }
      
      return {
        ...response,
        message: response.message ?? '',
      };
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw error;
    }
  },

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<null>('/auth/reset-password', {
        token,
        newPassword,
      });
      
      if (response.success) {
        console.log('✅ Password reset successful');
      }
      
      return {
        ...response,
        message: response.message ?? '',
      };
    } catch (error) {
      console.error('❌ Failed to reset password:', error);
      throw error;
    }
  },

  // Resend welcome email
  async resendWelcomeEmail(): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.post<null>('/auth/resend-welcome');
      
      if (response.success) {
        console.log('✅ Welcome email resent successfully');
      }
      
      return {
        ...response,
        message: response.message ?? '',
      };
    } catch (error) {
      console.error('❌ Failed to resend welcome email:', error);
      throw error;
    }
  },

  // Test email service
  async testEmail(emailType: 'welcome' | 'login' | 'password_change' | 'test' = 'test'): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post<any>('/auth/test-email', { emailType });
      
      if (response.success) {
        console.log('✅ Test email sent successfully');
      }
      
      return {
        ...response,
        message: response.message ?? '',
      };
    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return false;
    }

    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('🔄 Token expired, clearing storage');
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Invalid token format:', error);
      this.logout();
      return false;
    }
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        return JSON.parse(user);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Get current token
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Trigger storage event for navbar updates
    window.dispatchEvent(new Event('storage'));
  },

  // Clear authentication data (for cases where logout API isn't needed)
  clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ Authentication data cleared');
  },

  // Refresh token (if you implement refresh token logic)
  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/refresh');
      
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Token refreshed successfully');
      }
      
      return {
        ...response,
        message: response.message ?? '',
      };
    } catch (error) {
      console.error('❌ Failed to refresh token:', error);
      this.logout();
      throw error;
    }
  }
};

// Export individual functions for convenience
export const {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  resendWelcomeEmail,
  testEmail,
  isAuthenticated,
  getCurrentUser,
  getToken,
  logout,
  clearAuth,
  refreshToken
} = authService;

export default authService;

