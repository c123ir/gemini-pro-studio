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
