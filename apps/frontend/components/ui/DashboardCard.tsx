import React from 'react';

interface DashboardCardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    icon?: React.ReactNode;
    headerActions?: React.ReactNode;
    variant?: 'default' | 'gradient' | 'compact';
    id?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ 
    children, 
    className = '', 
    title, 
    icon, 
    headerActions,
    variant = 'default',
    id
}) => {
    const getCardClasses = () => {
        const baseClasses = 'rounded-2xl shadow-lg border';
        
        switch (variant) {
            case 'gradient':
                return `${baseClasses} bg-gradient-to-br from-white to-blue-50 border-blue-200`;
            case 'compact':
                return `${baseClasses} bg-white border-purple-200`;
            default:
                return `${baseClasses} bg-white border-indigo-200`;
        }
    };

    return (
        <div id={id} className={`${getCardClasses()} transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-indigo-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {icon && <div className="text-indigo-600">{icon}</div>}
                        <h3 className="text-xl font-semibold text-indigo-800">{title}</h3>
                    </div>
                    {headerActions && (
                        <div className="flex items-center space-x-2">
                            {headerActions}
                        </div>
                    )}
                </div>
            )}
            <div className={title ? 'p-6' : 'p-6'}>
                {children}
            </div>
        </div>
    );
};

export default DashboardCard;