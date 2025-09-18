
import React from 'react';

interface SparklineChartProps {
    data: number[];
    width?: number;
    height?: number;
    strokeWidth?: number;
    className?: string;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
    data,
    width = 120,
    height = 40,
    strokeWidth = 2,
    className = ''
}) => {
    if (!data || data.length < 2) {
        return <div className="text-xs text-text-secondary h-full w-full flex items-center justify-center">Not enough data for trend.</div>;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;

    // Normalize data points to fit within the SVG viewbox
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / (range || 1)) * height;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');

    const startPoint = {
        x: 0,
        y: height - ((data[0] - min) / (range || 1)) * height
    };

    const endPoint = {
        x: width,
        y: height - ((data[data.length - 1] - min) / (range || 1)) * height
    };
    
    const trendColor = data[data.length - 1] > data[0]
        ? 'stroke-secondary'
        : data[data.length - 1] < data[0]
        ? 'stroke-danger'
        : 'stroke-blue-400';
    
    const endPointColor = trendColor.replace('stroke-', 'fill-');

    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox={`-2 -2 ${width + 4} ${height + 4}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <polyline
                fill="none"
                className={trendColor}
                strokeWidth={strokeWidth}
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
             <circle cx={startPoint.x} cy={startPoint.y} r={strokeWidth} className={`fill-blue-400`} />
             <circle cx={endPoint.x} cy={endPoint.y} r={strokeWidth} className={endPointColor} />
        </svg>
    );
};
