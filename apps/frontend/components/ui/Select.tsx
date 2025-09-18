import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ children, className, ...props }) => {
    const baseClasses = "shadow-sm appearance-none border border-border rounded-lg w-full py-2 px-3 bg-surface text-text-primary leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";
    return (
        <select className={`${baseClasses} ${className}`} {...props}>
            {children}
        </select>
    );
};