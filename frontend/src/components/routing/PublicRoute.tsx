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
