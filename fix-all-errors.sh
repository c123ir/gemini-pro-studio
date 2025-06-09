#!/bin/bash
# fix-all-errors.sh - حل همه مشکلات یکجا

echo "🔧 حل همه مشکلات Frontend..."

# رنگ‌ها
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ایجاد ساختار پوشه‌ها
print_info "ایجاد ساختار پوشه‌ها..."
mkdir -p frontend/src/components/ui
mkdir -p frontend/src/components/routing
mkdir -p frontend/src/pages/auth

# 1. ایجاد LoadingSpinner.tsx
print_info "ایجاد LoadingSpinner.tsx..."
cat > frontend/src/components/ui/LoadingSpinner.tsx << 'EOF'
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white' | 'gray' | 'inherit';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  text,
  className = ''
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-green-600',
    white: 'text-white',
    gray: 'text-gray-600',
    inherit: 'text-current'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <svg
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin ${className}`}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
EOF

# 2. ایجاد ProtectedRoute.tsx
print_info "ایجاد ProtectedRoute.tsx..."
cat > frontend/src/components/routing/ProtectedRoute.tsx << 'EOF'
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" text="در حال بررسی احراز هویت..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
EOF

# 3. ایجاد PublicRoute.tsx  
print_info "ایجاد PublicRoute.tsx..."
cat > frontend/src/components/routing/PublicRoute.tsx << 'EOF'
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import LoadingSpinner from '../ui/LoadingSpinner';

interface PublicRouteProps {
  children: React.ReactNode;
  restricted?: boolean;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  restricted = true 
}) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" text="در حال بارگذاری..." />
      </div>
    );
  }

  if (restricted && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
EOF

# 4. ایجاد reportWebVitals.ts
print_info "ایجاد reportWebVitals.ts..."
cat > frontend/src/reportWebVitals.ts << 'EOF'
import { ReportHandler } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
EOF

# 5. اصلاح apiService.ts
print_info "اصلاح apiService.ts..."
cat > frontend/src/services/apiService.ts << 'EOF'
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

class ApiService {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5150/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          success: false,
          message: 'خطا در ارتباط با سرور'
        };

        if (error.response) {
          const data = error.response.data as any;
          apiError.message = data?.message || 'خطای سرور';
          apiError.errors = data?.errors;
        } else if (error.request) {
          apiError.message = 'عدم دسترسی به سرور';
        }

        return Promise.reject({ response: { data: apiError } });
      }
    );
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.authToken = null;
  }

  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
EOF

# 6. اصلاح App.test.tsx
print_info "اصلاح App.test.tsx..."
cat > frontend/src/App.test.tsx << 'EOF'
import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders app', () => {
  render(<App />);
});
EOF

# 7. نصب Dependencies
print_info "نصب Dependencies مفقود..."
cd frontend

npm install web-vitals @types/jest
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

print_status "همه مشکلات حل شدند!"
print_info "حالا می‌تونید پروژه رو اجرا کنید: npm start"