import React from 'react';
import { Card } from './Card';

interface AdminSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const AdminSection: React.FC<AdminSectionProps> = ({
  children,
  title,
  description,
  icon,
  actions,
  className = '',
  variant = 'default'
}) => {
  return (
    <Card variant={variant} padding="none" className={className}>
      {(title || description || actions) && (
        <div className="px-4 sm:px-6 py-4 border-b border-border bg-blue-50/50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {icon && (
                <div className="text-primary flex-shrink-0">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h3 className="text-lg sm:text-xl font-semibold text-text-primary">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-sm text-text-secondary mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </Card>
  );
};

// Standardized filter section component
interface FilterSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const FilterSection: React.FC<FilterSectionProps> = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg border border-border ${className}`}>
      {children}
    </div>
  );
};

// Standardized stats display component
interface StatsRowProps {
  children: React.ReactNode;
  className?: string;
}

export const StatsRow: React.FC<StatsRowProps> = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 ${className}`}>
      {children}
    </div>
  );
};

// Standardized action bar component
interface ActionBarProps {
  children: React.ReactNode;
  className?: string;
  justify?: 'start' | 'center' | 'end' | 'between';
  mobileStack?: boolean;
}

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between'
};

export const ActionBar: React.FC<ActionBarProps> = ({ 
  children, 
  className = '', 
  justify = 'between',
  mobileStack = false
}) => {
  const baseClasses = mobileStack 
    ? 'flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4'
    : 'flex flex-wrap items-center gap-3 sm:gap-4';
    
  return (
    <div className={`${baseClasses} ${justifyClasses[justify]} ${className}`}>
      {children}
    </div>
  );
};