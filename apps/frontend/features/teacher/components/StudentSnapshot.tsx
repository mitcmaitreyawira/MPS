
import React, { useMemo } from 'react';
import { User, PointLog, PointType } from '../../../types';
import { SparklineChart } from '../../shared/SparklineChart';

export const StudentSnapshot: React.FC<{ student: User | null, points: PointLog[] }> = ({ student, points }) => {
    if (!student) return null;

    const studentPoints = useMemo(() => {
        return points.filter(p => p.studentId === student.id);
    }, [points, student.id]);

    // Calculate total points from actual point logs (no hardcoded base needed)
    const totalPoints = Math.max(0, studentPoints.reduce((acc, p) => acc + p.points, 0));

    const lastViolation = useMemo(() => {
        return studentPoints
        .filter(p => p.type === PointType.VIOLATION)
        .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    }, [studentPoints]);

    const badgeCount = useMemo(() => {
        return studentPoints.filter(p => p.badge).length;
    }, [studentPoints]);

    const pointsTrend = useMemo(() => {
        const trendDays = 30;
        if (studentPoints.length === 0) return Array(trendDays).fill(100);
        
        const sortedLogs = [...studentPoints].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const firstDateInWindow = new Date();
        firstDateInWindow.setDate(firstDateInWindow.getDate() - (trendDays - 1));
        firstDateInWindow.setHours(0, 0, 0, 0);

        // Calculate initial total from actual point logs
        const initialTotal = sortedLogs
            .filter(log => new Date(log.timestamp) < firstDateInWindow)
            .reduce((sum, log) => sum + log.points, 0);
        
        const dailyDeltas = new Map<string, number>();
        sortedLogs
            .filter(log => new Date(log.timestamp) >= firstDateInWindow)
            .forEach(log => {
                const dateKey = new Date(log.timestamp).toISOString().split('T')[0];
                dailyDeltas.set(dateKey, (dailyDeltas.get(dateKey) || 0) + log.points);
            });

        const trendData = new Array(trendDays).fill(0);
        let runningTotal = initialTotal;
        for (let i = 0; i < trendDays; i++) {
            const currentDate = new Date(firstDateInWindow);
            currentDate.setDate(firstDateInWindow.getDate() + i);
            const dateKey = currentDate.toISOString().split('T')[0];
            
            runningTotal += dailyDeltas.get(dateKey) || 0;
            trendData[i] = runningTotal;
        }
        
        // Ensure trend line doesn't dip below zero.
        return trendData.map(p => Math.max(0, p));
    }, [studentPoints]);

    return (
        <div className="p-4 bg-slate-50 border border-border rounded-lg mt-4 animate-fade-in-up">
            <h4 className="font-bold text-text-primary">{student.name}'s Snapshot</h4>
            {student.className && <p className="text-xs text-text-secondary -mt-1 mb-2">{student.className}</p>}
            <div className="text-sm text-text-secondary mt-2 space-y-2">
                <div className="flex justify-between items-center">
                    <span>Current Points:</span>
                    <span className="font-bold text-primary text-lg">{totalPoints}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span>Badges Earned:</span>
                    <span className="font-bold text-accent">{badgeCount}</span>
                </div>

                <div className="pt-2">
                    <h5 className="text-xs font-medium text-text-secondary mb-1">30-Day Trend</h5>
                    <div className="flex justify-center items-center bg-white p-2 rounded-md shadow-inner">
                        <SparklineChart data={pointsTrend} />
                    </div>
                </div>

                {lastViolation ? (
                    <p className="pt-2">Last Violation: <span className="font-medium text-danger">{lastViolation.category}</span> on {new Date(lastViolation.timestamp).toLocaleDateString()}</p>
                ) : (
                    <p className="pt-2 text-secondary">No violations on record. Great job!</p>
                )}
            </div>
        </div>
    );
};
