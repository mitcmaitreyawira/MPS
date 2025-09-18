

import React, { useMemo, useState } from 'react';
import { PointLog } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { ChartBarIcon } from '../../../assets/icons';

interface ChartData {
    date: string;
    rewards: number;
    violations: number;
}

interface TooltipData {
    x: number;
    y: number;
    data: ChartData;
}

const Chart: React.FC<{ points: PointLog[] }> = ({ points }) => {
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);

    const chartData = useMemo(() => {
        const data: { [key: string]: { rewards: number; violations: number } } = {};
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            data[dateString] = { rewards: 0, violations: 0 };
        }

        points.forEach(log => {
            const dateString = new Date(log.timestamp).toISOString().split('T')[0];
            if (data[dateString]) {
                if (log.points > 0) {
                    data[dateString].rewards += log.points;
                } else {
                    data[dateString].violations += Math.abs(log.points);
                }
            }
        });

        return Object.entries(data).map(([date, values]) => ({
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            ...values,
        }));
    }, [points]);
    
    const maxVal = Math.max(...chartData.map(d => Math.max(d.rewards, d.violations)), 10);
    const yAxisLabels = [0, Math.round(maxVal / 2), maxVal];

    const width = 500;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Y-Axis */}
                {yAxisLabels.map(label => {
                    const y = chartHeight - (label / maxVal) * chartHeight;
                    return (
                        <g key={label} transform={`translate(${margin.left}, ${margin.top})`}>
                            <text x={-10} y={y + 4} textAnchor="end" className="text-xs fill-current text-text-secondary">
                                {label}
                            </text>
                            <line x1={0} y1={y} x2={chartWidth} y2={y} className="stroke-current text-border" strokeDasharray="2,2" />
                        </g>
                    );
                })}

                {/* Bars */}
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {chartData.map((d, i) => {
                        const barWidth = chartWidth / chartData.length;
                        const barPadding = 4;
                        const x = i * barWidth;
                        const rewardHeight = (d.rewards / maxVal) * chartHeight;
                        const violationHeight = (d.violations / maxVal) * chartHeight;

                        return (
                            <g key={d.date} onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setTooltip({
                                    x: e.clientX - rect.left + 10,
                                    y: e.clientY - rect.top - 10,
                                    data: d
                                });
                            }} onMouseLeave={() => setTooltip(null)}>
                                <rect
                                    x={x + barPadding / 2}
                                    y={chartHeight - rewardHeight}
                                    width={barWidth / 2 - barPadding / 2}
                                    height={rewardHeight}
                                    className="fill-current text-secondary"
                                />
                                <rect
                                    x={x + barWidth / 2}
                                    y={chartHeight - violationHeight}
                                    width={barWidth / 2 - barPadding / 2}
                                    height={violationHeight}
                                    className="fill-current text-danger"
                                />
                                {chartData.length <= 30 && i % 4 === 0 && (
                                    <text x={x + barWidth / 2} y={chartHeight + 15} textAnchor="middle" className="text-xs fill-current text-text-secondary">
                                        {d.date}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </g>
            </svg>
            {tooltip && (
                <div
                    className="absolute bg-slate-800 text-white text-xs rounded-md p-2 pointer-events-none shadow-lg"
                    style={{ left: tooltip.x, top: tooltip.y, transform: 'translateY(-100%)' }}
                >
                    <p className="font-bold">{tooltip.data.date}</p>
                    <p><span className="text-secondary font-semibold">+{tooltip.data.rewards}</span> Rewards</p>
                    <p><span className="text-danger font-semibold">-{tooltip.data.violations}</span> Violations</p>
                </div>
            )}
        </div>
    );
};

export const PointsActivityChart: React.FC<{ points: PointLog[] }> = ({ points }) => {
    return (
        <Card title="Last 30 Days Activity" icon={<ChartBarIcon className="h-5 w-5" />}>
            <Chart points={points} />
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mt-2 text-xs text-text-secondary">
                <div className="flex items-center">
                    <span className="h-3 w-3 rounded-sm bg-secondary mr-1.5"></span>
                    <span>Rewards</span>
                </div>
                <div className="flex items-center">
                    <span className="h-3 w-3 rounded-sm bg-danger mr-1.5"></span>
                    <span>Violations</span>
                </div>
            </div>
        </Card>
    );
};