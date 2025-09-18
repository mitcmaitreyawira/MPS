import React from 'react';
import { InputProps } from '../../types';

export const Input: React.FC<InputProps> = ({
  className = '',
  type = 'text',
  name,
  value,
  placeholder,
  required = false,
  disabled = false,
  onChange,
  onBlur,
  min,
  max,
  ...props
}) => {
  const baseClasses = 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
  const errorClasses = ''; // Could be extended for error states

  return (
    <input
      type={type}
      name={name}
      value={value}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      onChange={onChange}
      onBlur={onBlur}
      min={min}
      max={max}
      className={`
        ${baseClasses}
        ${disabledClasses}
        ${errorClasses}
        ${className}
      `.trim()}
      {...props}
    />
  );
};