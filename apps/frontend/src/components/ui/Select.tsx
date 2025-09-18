import React from 'react';
import { SelectProps } from '../../types';

export const Select: React.FC<SelectProps> = ({
  children,
  className = '',
  name,
  value,
  required = false,
  disabled = false,
  onChange,
  options,
  ...props
}) => {
  const baseClasses = 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : '';

  return (
    <select
      name={name}
      value={value}
      required={required}
      disabled={disabled}
      onChange={onChange}
      className={`
        ${baseClasses}
        ${disabledClasses}
        ${className}
      `.trim()}
      {...props}
    >
      {options ? (
        options.map((option) => (
          <option 
            key={option.value} 
            value={option.value} 
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))
      ) : (
        children
      )}
    </select>
  );
};