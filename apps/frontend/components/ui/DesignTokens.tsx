import React from 'react';

// Design tokens for consistent styling across the admin panel
export const designTokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },
  borderRadius: {
    sm: '0.25rem',  // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem',   // 8px
    xl: '0.75rem',  // 12px
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  typography: {
    fontSizes: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
};

// Utility function to get design token values
export const getToken = (path: string) => {
  return path.split('.').reduce((obj, key) => obj?.[key], designTokens);
};

// Status color mappings for consistent usage
export const statusColors = {
  active: designTokens.colors.success[500],
  inactive: designTokens.colors.neutral[400],
  pending: designTokens.colors.warning[500],
  error: designTokens.colors.danger[500],
  info: designTokens.colors.primary[500],
};

// Component variants for consistent styling
export const componentVariants = {
  button: {
    primary: {
      bg: designTokens.colors.primary[600],
      hover: designTokens.colors.primary[700],
      text: 'white',
    },
    secondary: {
      bg: designTokens.colors.neutral[100],
      hover: designTokens.colors.neutral[200],
      text: designTokens.colors.neutral[700],
    },
    success: {
      bg: designTokens.colors.success[600],
      hover: designTokens.colors.success[700],
      text: 'white',
    },
    warning: {
      bg: designTokens.colors.warning[600],
      hover: designTokens.colors.warning[700],
      text: 'white',
    },
    danger: {
      bg: designTokens.colors.danger[600],
      hover: designTokens.colors.danger[700],
      text: 'white',
    },
  },
  card: {
    default: {
      bg: 'white',
      border: designTokens.colors.neutral[200],
      shadow: designTokens.shadows.sm,
    },
    elevated: {
      bg: 'white',
      border: designTokens.colors.neutral[200],
      shadow: designTokens.shadows.md,
    },
    highlighted: {
      bg: designTokens.colors.primary[50],
      border: designTokens.colors.primary[200],
      shadow: designTokens.shadows.sm,
    },
  },
};

export default designTokens;