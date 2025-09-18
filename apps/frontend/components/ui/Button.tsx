import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50 border border-primary',
  secondary: 'bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-500/50 border border-blue-200',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/50 border border-red-500',
  ghost: 'bg-transparent text-blue-600 hover:bg-blue-100 focus:ring-blue-500/50 border border-transparent',
  outline: 'bg-transparent text-primary hover:bg-primary/5 focus:ring-primary/50 border border-primary',
  success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500/50 border border-green-500'
};

const sizeClasses = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl'
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  loading = false,
  fullWidth = false,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${loading ? 'cursor-wait' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};