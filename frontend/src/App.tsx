// frontend/src/App.tsx
// کامپوننت اصلی اپلیکیشن - اصلاح شده

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { apiService } from './services/apiService';

// Components
import LoadingSpinner from './components/ui/LoadingSpinner';
import ProtectedRoute from './components/routing/ProtectedRoute';
import PublicRoute from './components/routing/PublicRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/chat/ChatPage';

// CSS
import './index.css';

const App: React.FC = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    isInitialized,
    initializeAuth,
    token 
  } = useAuthStore();

  // Initialize authentication on app start
  useEffect(() => {
    const initApp = async () => {
      try {
        // Set API token if exists
        if (token) {
          apiService.setAuthToken(token);
        }
        
        // Initialize authentication
        await initializeAuth();
      } catch (error) {
        console.error('App initialization failed:', error);
      }
    };

    if (!isInitialized) {
      initApp();
    }
  }, [initializeAuth, isInitialized, token]);

  // Show loading screen while checking authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Gemini Pro Studio
          </h1>
          <LoadingSpinner size="medium" text="در حال بارگذاری..." />
        </div>
      </div>
    );
  }

  return (
    <div className="App" dir="rtl">
      <Router>
        <Routes>
          {/* Public routes (accessible only when not authenticated) */}
          <Route 
            path="/auth/login" 
            element={
              <PublicRoute restricted={true}>
                <Login />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/auth/register" 
            element={
              <PublicRoute restricted={true}>
                <Register />
              </PublicRoute>
            } 
          />

          {/* Protected routes (require authentication) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Chat Routes */}
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/chat/:conversationId" 
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            } 
          />

          {/* Root redirect */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Navigate to="/auth/login" replace />
            } 
          />

          {/* 404 Not Found */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center max-w-md">
                  <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    صفحه یافت نشد
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    صفحه‌ای که دنبال آن می‌گردید وجود ندارد.
                  </p>
                  <button
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    بازگشت
                  </button>
                </div>
              </div>
            } 
          />
        </Routes>

        {/* Global Toast Notifications */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#374151',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontFamily: 'sans-serif',
              fontSize: '14px',
              direction: 'rtl'
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
      </Router>
    </div>
  );
};

export default App;