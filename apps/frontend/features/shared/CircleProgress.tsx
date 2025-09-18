import React from 'react';

interface CircleProgressProps {
    points: number; // The actual point value to determine color and display
    goal?: number; // The goal to calculate progress against, defaults to 100
    size?: number;
    strokeWidth?: number;
    className?: string;
}

export const CircleProgress: React.FC<CircleProgressProps> = ({ points, goal = 100, size = 200, strokeWidth = 15, className }) => {
    // Progress is capped at 100% visually, even if points exceed the goal.
    const progress = Math.min((points / goal) * 100, 100);
    
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    const getColor = () => {
        // Color is based on the absolute point value.
        if (points < 70) return 'text-danger';
        if (points < 80) return 'text-warning';
        return 'text-secondary';
    };

    const colorClass = getColor();

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} style={{ transform: 'rotate(-90deg)' }}>
            <circle
                className="text-blue-200"
                stroke="currentColor"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={radius}
                cx={size / 2}
                cy={size / 2}
            />
            <circle
                className={colorClass}
                stroke="currentColor"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                    transition: 'stroke-dashoffset 0.5s ease-in-out, stroke 0.5s ease-in-out',
                }}
            />
        </svg>
    );
};
