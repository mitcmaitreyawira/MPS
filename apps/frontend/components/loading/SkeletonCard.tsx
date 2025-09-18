import React from 'react';
import { Skeleton } from './Skeleton';

export const SkeletonCard: React.FC = () => {
    return (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-4 space-y-4 h-full">
            <Skeleton className="h-6 w-1/3" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
    );
};