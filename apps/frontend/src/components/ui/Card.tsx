import React from 'react';
import { CardProps } from '../../types';

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'md',
  border = true 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  const borderClass = border ? 'border border-gray-200' : '';

  return (
    <div 
      className={`
        bg-white rounded-lg 
        ${paddingClasses[padding]} 
        ${shadowClasses[shadow]} 
        ${borderClass} 
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
};