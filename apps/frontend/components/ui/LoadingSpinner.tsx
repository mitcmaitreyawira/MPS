import React from 'react';
import { designTokens } from './DesignTokens';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const variantClasses = {
  primary: 'text-primary',
  secondary: 'text-neutral-500',
  white: 'text-white',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className = '',
  text,
  fullScreen = false,
}) => {
  const spinner = (
    <div className={`inline-flex items-center ${className}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} ${variantClasses[variant]}`}
        xmlns="http://www.w3.org/2000/svg"
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
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {text && (
        <span className={`ml-2 text-sm font-medium ${variantClasses[variant]}`}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

// Skeleton loading component for better UX
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = 'animate-pulse bg-neutral-200 rounded';
  
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
            style={index === 0 ? style : {}}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Loading overlay for forms and sections
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  text = 'Loading...',
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <LoadingSpinner text={text} />
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;