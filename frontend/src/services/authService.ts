// frontend/src/services/authService.ts
// Authentication Service - نسخه سازگار با Store

import { apiService } from './apiService';
import type { User, LoginCredentials, RegisterData } from '../store/authStore';

// Response types
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
  };
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

// Authentication Service Class
class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse['data']> {
    try {
      const response = await apiService.post<AuthResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe || false
      });

      if (!response.data) {
        throw new Error('پاسخ نامعتبر از سرور دریافت شد');
      }

      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse['data']> {
    try {
      // Validate passwords match if confirmPassword is provided
      if (data.confirmPassword && data.password !== data.confirmPassword) {
        throw new Error('رمزهای عبور یکسان نیستند');
      }

      const response = await apiService.post<AuthResponse>('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password
      });

      if (!response.data) {
        throw new Error('پاسخ نامعتبر از سرور دریافت شد');
      }

      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  // Get current user profile
  async getProfile(): Promise<ProfileResponse['data']> {
    try {
      const response = await apiService.get<ProfileResponse>('/auth/profile');
      
      if (!response.data) {
        throw new Error('پاسخ نامعتبر از سرور دریافت شد');
      }
      
      return response.data;
    } catch (error) {
      console.error('Get profile failed:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<ProfileResponse['data']> {
    try {
      const response = await apiService.put<ProfileResponse>('/auth/profile', data);
      
      if (!response.data) {
        throw new Error('پاسخ نامعتبر از سرور دریافت شد');
      }
      
      return response.data;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<MessageResponse> {
    try {
      const response = await apiService.put<MessageResponse>('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      return response;
    } catch (error) {
      console.error('Change password failed:', error);
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<MessageResponse> {
    try {
      const response = await apiService.post<MessageResponse>('/auth/logout');
      return response;
    } catch (error) {
      // Even if logout fails on server, continue with client-side cleanup
      console.warn('Logout API call failed:', error);
      return {
        success: true,
        message: 'خروج انجام شد'
      };
    }
  }

  // Forgot password
  async forgotPassword(email: string): Promise<MessageResponse> {
    try {
      const response = await apiService.post<MessageResponse>('/auth/forgot-password', {
        email
      });
      return response;
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(token: string, password: string): Promise<MessageResponse> {
    try {
      const response = await apiService.post<MessageResponse>('/auth/reset-password', {
        token,
        password
      });
      return response;
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  }

  // Verify email
  async verifyEmail(token: string): Promise<MessageResponse> {
    try {
      const response = await apiService.post<MessageResponse>('/auth/verify-email', {
        token
      });
      return response;
    } catch (error) {
      console.error('Email verification failed:', error);
      throw error;
    }
  }

  // Resend verification email
  async resendVerification(): Promise<MessageResponse> {
    try {
      const response = await apiService.post<MessageResponse>('/auth/resend-verification');
      return response;
    } catch (error) {
      console.error('Resend verification failed:', error);
      throw error;
    }
  }

  // Utility methods

  // Check if user is authenticated (has valid token)
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth-storage');
    if (!token) return false;
    
    try {
      const parsed = JSON.parse(token);
      return parsed.state?.isAuthenticated || false;
    } catch {
      return false;
    }
  }

  // Get stored token
  getToken(): string | null {
    const storage = localStorage.getItem('auth-storage');
    if (!storage) return null;
    
    try {
      const parsed = JSON.parse(storage);
      return parsed.state?.token || null;
    } catch {
      return null;
    }
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('رمز عبور باید حداقل ۸ کاراکتر باشد');
    }

    // Uppercase letter
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('حداقل یک حرف بزرگ انگلیسی');
    }

    // Lowercase letter
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('حداقل یک حرف کوچک انگلیسی');
    }

    // Number
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('حداقل یک عدد');
    }

    // Special character
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('حداقل یک کاراکتر ویژه');
    }

    return {
      isValid: score >= 4,
      score,
      feedback
    };
  }

  // Clear authentication data
  clearAuthData(): void {
    localStorage.removeItem('auth-storage');
    sessionStorage.removeItem('auth-storage');
  }
}

export const authService = new AuthService();
export default authService;