// frontend/src/components/ui/ErrorBoundary.tsx
// مدیریت خطاهای React - Error Boundary Component

import React, { Component, ErrorInfo } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    // like Sentry, LogRocket, etc.
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              {/* Error Icon */}
              <div className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              {/* Error Title */}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                خطایی رخ داده است
              </h2>

              {/* Error Description */}
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                متأسفانه در اجرای برنامه خطایی رخ داده است. لطفاً صفحه را مجدداً بارگذاری کنید یا مجدداً تلاش کنید.
              </p>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-md p-4 mb-6 text-left">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Error Details:
                  </h3>
                  <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-auto max-h-32">
                    {this.state.error.message}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.resetError}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  تلاش مجدد
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  بارگذاری مجدد صفحه
                </button>
              </div>

              {/* Help Text */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                اگر این خطا مکرراً رخ می‌دهد، لطفاً با پشتیبانی تماس بگیرید.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;