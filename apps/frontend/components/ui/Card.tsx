import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  icon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  actions?: React.ReactNode;
}

const variantClasses = {
  default: 'bg-white border border-border shadow-sm hover:shadow-md',
  elevated: 'bg-white border border-border shadow-md hover:shadow-lg',
  outlined: 'bg-white border-2 border-border shadow-none hover:border-primary/20',
  filled: 'bg-blue-50 border border-border shadow-sm hover:shadow-md'
};

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

export const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  icon, 
  className = '', 
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  onClick,
  actions
}) => {
  const Component = clickable || onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={`
        rounded-lg transition-all duration-200
        ${variantClasses[variant]}
        ${hover || clickable ? 'hover:scale-[1.02]' : ''}
        ${clickable ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-left' : ''}
        ${className}
      `}
      type={clickable ? 'button' : undefined}
    >
      {(title || icon || actions) && (
        <div className="px-6 py-4 border-b border-border bg-blue-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && <div className="text-primary flex-shrink-0">{icon}</div>}
              {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
            </div>
            {actions && <div className="flex items-center space-x-2">{actions}</div>}
          </div>
        </div>
      )}
      <div className={paddingClasses[padding]}>
        {children}
      </div>
    </Component>
  );
};

// Card Header Component
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function CardHeader({ children, className = '', actions }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div className="flex-1">{children}</div>
      {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </div>
  );
}

// Card Title Component
interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4;
}

export function CardTitle({ children, className = '', level = 2 }: CardTitleProps) {
  const levelClasses = {
    1: 'text-2xl font-bold',
    2: 'text-xl font-semibold',
    3: 'text-lg font-medium',
    4: 'text-base font-medium',
  };

  const combinedClassName = `text-text-primary ${levelClasses[level]} ${className}`;

  switch (level) {
    case 1:
      return <h1 className={combinedClassName}>{children}</h1>;
    case 2:
      return <h2 className={combinedClassName}>{children}</h2>;
    case 3:
      return <h3 className={combinedClassName}>{children}</h3>;
    case 4:
      return <h4 className={combinedClassName}>{children}</h4>;
    default:
      return <h2 className={combinedClassName}>{children}</h2>;
  }
}

// Card Content Component
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// Card Footer Component
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

export function CardFooter({ children, className = '', align = 'right' }: CardFooterProps) {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={`flex items-center mt-6 pt-4 border-t border-border ${alignmentClasses[align]} ${className}`}>
      {children}
    </div>
  );
}

export default Card;