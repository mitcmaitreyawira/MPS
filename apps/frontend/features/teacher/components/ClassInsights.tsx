

import React, { useMemo } from 'react';
import { User, PointLog, PointType } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { getAvatarColor, getInitials } from '../../../utils/helpers';
import { SparklesIcon, ExclamationTriangleIcon, ArrowUpCircleIcon, ArrowDownCircleIcon } from '../../../assets/icons';

interface ClassInsightsProps {
    classPoints: PointLog[];
    classStudents: User[];
}

const InsightList: React.FC<{
    title: string;
    icon: React.ReactNode;
    items: { student: User, value: number }[];
    colorClass: 'text-secondary' | 'text-danger';
}> = ({ title, icon, items, colorClass }) => (
    <div className="bg-slate-50 p-4 rounded-lg h-full">
        <h3 className="flex items-center text-md font-bold text-text-primary mb-3">
            {icon}
            <span className="ml-2">{title}</span>
        </h3>
        {items.length > 0 ? (
            <ul className="space-y-3">
                {items.map(({ student, value }) => (
                    <li key={student.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs ${getAvatarColor(student.name)}`}>
                                {getInitials(student.name)}
                            </div>
                            <span className="font-medium">{student.name}</span>
                        </div>
                        <span className={`font-bold ${colorClass}`}>{value > 0 ? `+${value}` : value} pts</span>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-sm text-text-secondary text-center pt-8">No data available.</p>
        )}
    </div>
);

export const ClassInsights: React.FC<ClassInsightsProps> = ({ classPoints, classStudents }) => {

    const { topMovers, studentsToWatch, topRewardCats, topViolationCats } = useMemo(() => {
        const studentStats = classStudents.map(student => {
            const studentLogs = classPoints.filter(p => p.studentId === student.id);
            const positivePoints = studentLogs
                .filter(p => p.points > 0)
                .reduce((sum, p) => sum + p.points, 0);
            const negativePoints = studentLogs
                .filter(p => p.points < 0)
                .reduce((sum, p) => sum + p.points, 0);
            return { student, positivePoints, negativePoints };
        });

        const topMovers = [...studentStats]
            .sort((a, b) => b.positivePoints - a.positivePoints)
            .filter(s => s.positivePoints > 0)
            .slice(0, 5)
            .map(s => ({ student: s.student, value: s.positivePoints }));

        const studentsToWatch = [...studentStats]
            .sort((a, b) => a.negativePoints - b.negativePoints)
            .filter(s => s.negativePoints < 0)
            .slice(0, 5)
            .map(s => ({ student: s.student, value: s.negativePoints }));

        const rewardCategories: Record<string, number> = {};
        const violationCategories: Record<string, number> = {};

        classPoints.forEach(log => {
            if (log.type === PointType.REWARD) {
                rewardCategories[log.category] = (rewardCategories[log.category] || 0) + 1;
            } else if (log.type === PointType.VIOLATION) {
                violationCategories[log.category] = (violationCategories[log.category] || 0) + 1;
            }
        });

        const topRewardCats = Object.entries(rewardCategories).sort(([, a], [, b]) => b - a).slice(0, 3).map(([name]) => name);
        const topViolationCats = Object.entries(violationCategories).sort(([, a], [, b]) => b - a).slice(0, 3).map(([name]) => name);

        return { topMovers, studentsToWatch, topRewardCats, topViolationCats };
    }, [classPoints, classStudents]);

    return (
        <Card icon={<SparklesIcon className="h-6 w-6 text-primary" />} title="Class Insights">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <InsightList 
                    title="Top Positive Movers"
                    icon={<ArrowUpCircleIcon className="h-6 w-6 text-secondary" />}
                    items={topMovers}
                    colorClass="text-secondary"
                />

                <InsightList 
                    title="Students to Watch"
                    icon={<ArrowDownCircleIcon className="h-6 w-6 text-danger" />}
                    items={studentsToWatch}
                    colorClass="text-danger"
                />
                
                <div className="bg-slate-50 p-4 rounded-lg">
                     <h3 className="flex items-center text-md font-bold text-text-primary mb-3">
                        <ExclamationTriangleIcon className="h-6 w-6 text-accent" />
                        <span className="ml-2">Class Behavior Trends</span>
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold text-secondary mb-2">Top Reward Reasons</h4>
                             {topRewardCats.length > 0 ? (
                                <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
                                    {topRewardCats.map(cat => <li key={cat}>{cat}</li>)}
                                </ul>
                            ) : <p className="text-sm text-text-secondary">No rewards recorded yet.</p>}
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-danger mb-2">Top Violation Reasons</h4>
                             {topViolationCats.length > 0 ? (
                                <ul className="list-disc list-inside text-sm text-text-secondary space-y-1">
                                    {topViolationCats.map(cat => <li key={cat}>{cat}</li>)}
                                </ul>
                            ) : <p className="text-sm text-text-secondary">No violations recorded yet.</p>}
                        </div>
                    </div>
                </div>

            </div>
        </Card>
    );
};