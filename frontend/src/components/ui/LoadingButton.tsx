import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export interface LoadingButtonProps {
  isLoading: boolean;
  text: string;
  loadingText?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  text,
  loadingText,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  className = '',
  onClick,
  disabled = false
}) => {
  const baseClasses = 'rounded-md font-medium focus:outline-none transition-colors duration-150 flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-300',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white disabled:bg-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300',
    success: 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-300'
  };

  const sizeClasses = {
    small: 'py-1 px-3 text-sm',
    medium: 'py-2 px-4 text-base',
    large: 'py-3 px-6 text-lg'
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="small" color="white" className="mr-2" />
          <span>{loadingText || text}</span>
        </>
      ) : (
        <span>{text}</span>
      )}
    </button>
  );
};

export default LoadingButton;