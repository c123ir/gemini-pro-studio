// frontend/src/store/authStore.ts
// Authentication State Management - نسخه صحیح و کامل

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '../services/authService';
import { apiService } from '../services/apiService';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  initializeAuth: () => Promise<void>;
  
  // Utility actions
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

// Create the store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Login action
      login: async (credentials: LoginCredentials) => {
        const { setLoading, setError } = get();
        
        try {
          setLoading(true);
          setError(null);
          
          const { user, token } = await authService.login(credentials);

            // Set authentication data
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Set API default headers
            apiService.setAuthToken(token);
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'خطا در ورود به سیستم';
          
          set({ 
            isLoading: false,
            error: errorMessage
          });
          
          throw error;
        }
      },

      // Register action
      register: async (data: RegisterData) => {
        const { setLoading, setError } = get();
        
        try {
          setLoading(true);
          setError(null);
          
          const { user, token } = await authService.register(data);

            // Set authentication data
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            // Set API default headers
            apiService.setAuthToken(token);
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 
                              error.message || 
                              'خطا در ثبت‌نام';
          
          set({ 
            isLoading: false,
            error: errorMessage
          });
          
          throw error;
        }
      },

      // Logout action
      logout: async () => {
        const { clearAuth } = get();
        
        try {
          await authService.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.warn('Logout API call failed:', error);
        } finally {
          clearAuth();
        }
      },

      // Update user action
      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        
        if (user) {
          set({
            user: { ...user, ...userData }
          });
        }
      },

      // Initialize authentication
      initializeAuth: async () => {
        const { token, setLoading, clearAuth } = get();
        
        try {
          setLoading(true);

          if (!token) {
            set({ isInitialized: true, isLoading: false });
            return;
          }

          // Set API headers
          apiService.setAuthToken(token);
          
          // Verify token with server
          try {
            const { user } = await authService.getProfile();
              set({
              user,
                isAuthenticated: true,
                isInitialized: true,
                isLoading: false,
              });
          } catch (error) {
            clearAuth();
            set({ isInitialized: true });
          }

        } catch (error) {
          console.error('Auth initialization failed:', error);
          clearAuth();
          set({ isInitialized: true, isLoading: false });
        }
      },

      // Clear authentication data
      clearAuth: () => {
        set({
          ...initialState,
          isInitialized: true,
        });
        
        // Clear API headers
        apiService.clearAuthToken();
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Set error
      setError: (error: string | null) => {
        set({ error });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized
      }),
    }
  )
);

// Selectors
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  register: state.register,
  logout: state.logout,
  updateUser: state.updateUser,
  clearError: state.clearError
}));