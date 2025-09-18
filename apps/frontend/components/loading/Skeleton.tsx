import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={`bg-blue-200 rounded-md animate-pulse ${className}`} />
    );
};