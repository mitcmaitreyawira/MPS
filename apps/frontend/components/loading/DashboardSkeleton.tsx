import React from 'react';
import { Skeleton } from './Skeleton';
import { SkeletonCard } from './SkeletonCard';

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Page Header */}
            <Skeleton className="h-10 w-1/2" />

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <SkeletonCard />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <SkeletonCard />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    );
};