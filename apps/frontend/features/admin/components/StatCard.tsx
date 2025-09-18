
import React from 'react';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactElement<{ className?: string }>;
    variant?: 'default' | 'warning';
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, variant = 'default' }) => {
    const variantClasses = {
        default: 'text-primary',
        warning: 'text-warning',
    };

    return (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-4 h-full transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
            <div className="flex items-center text-text-secondary">
                <div className={`mr-3 ${variantClasses[variant]}`}>
                   {React.cloneElement(icon, { className: "h-6 w-6" })}
                </div>
                <span className="font-semibold text-sm">{title}</span>
            </div>
            <p className="text-4xl font-bold text-text-primary mt-2">{value}</p>
        </div>
    );
};
