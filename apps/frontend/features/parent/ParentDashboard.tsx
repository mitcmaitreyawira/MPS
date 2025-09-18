
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { User, PointLog, PointType, BadgeTier } from '../../types';
import * as api from '../../services/api';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { CircleProgress } from '../shared/CircleProgress';
import ActivityLog from '../shared/ActivityLog';
import { HallOfFame } from '../student/components/HallOfFame';
import { ShieldExclamationIcon, CheckCircleIcon, ExclamationTriangleIcon, FireIcon, AwardIcon, ArrowUpCircleIcon, ArrowDownCircleIcon, MedalIcon, UserCircleIcon, AcademicCapIcon } from '../../assets/icons';
import ReportTeacherFooter from '../shared/ReportTeacherFooter';
import { DashboardSkeleton } from '../../components/loading/DashboardSkeleton';

interface ParentDashboardData {
    children: User[];
    points: PointLog[];
    users: User[]; // All users for activity log popovers
}

const ChildDataView: React.FC<{ student: User, allPoints: PointLog[], allUsers: User[] }> = ({ student, allPoints, allUsers }) => {
    const studentPoints = useMemo(() => {
        return allPoints.filter(p => p.studentId === student.id);
    }, [allPoints, student.id]);

    const totalPoints = useMemo(() => {
        // Calculate total points from actual point logs (no hardcoded base needed)
        return Math.max(0, studentPoints.reduce((acc, p) => acc + p.points, 0));
    }, [studentPoints]);
    
    // The displayPoints are capped at 100 for the progress circle visual only.
    const displayPoints = Math.min(100, totalPoints);

    const { accountStatus, statusColor, statusIcon, pointsGained, pointsLost } = useMemo(() => {
        const gained = studentPoints.filter(p => p.points > 0).reduce((acc, p) => acc + p.points, 0);
        const lost = Math.abs(studentPoints.filter(p => p.points < 0).reduce((acc, p) => acc + p.points, 0));
        
        let status = 'Safe';
        let color = 'text-secondary';
        let icon = <CheckCircleIcon className="w-5 h-5"/>;

        if (displayPoints < 70) {
            status = 'At Risk';
            color = 'text-danger';
            icon = <ShieldExclamationIcon className="w-5 h-5"/>;
        } else if (displayPoints < 80) {
            status = 'Warning';
            color = 'text-warning';
            icon = <ExclamationTriangleIcon className="w-5 h-5"/>;
        }
        return { accountStatus: status, statusColor: color, statusIcon: icon, pointsGained: gained, pointsLost: lost };
    }, [studentPoints, displayPoints]);

    const pointLogsWithBadges = useMemo(() => {
        return studentPoints.filter(p => p.badge).sort((a,b) => {
            const tierOrder = { [BadgeTier.GOLD]: 0, [BadgeTier.SILVER]: 1, [BadgeTier.BRONZE]: 2 };
            return tierOrder[a.badge!.tier] - tierOrder[b.badge!.tier];
        });
    }, [studentPoints]);

    const daysWithoutViolations = useMemo(() => {
        const violations = studentPoints
            .filter(p => p.type === PointType.VIOLATION)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (violations.length === 0) return 999;
        const lastViolationDate = new Date(violations[0].timestamp);
        const diffTime = Math.abs(new Date().getTime() - lastViolationDate.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }, [studentPoints]);

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <Card className="lg:col-span-1 p-6 space-y-4">
                     <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold text-text-primary">{student.name}'s Progress</h2>
                        <p className="text-md text-text-secondary mt-1">{student.className}</p>
                    </div>
                    <div className="relative w-max mx-auto">
                        <CircleProgress goal={100} points={displayPoints} size={220} strokeWidth={20} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-6xl font-bold text-text-primary">{totalPoints}</span>
                            <span className="text-md text-text-secondary mb-2">Points</span>
                             <div className={`flex items-center space-x-2 ${statusColor}`}>
                                {statusIcon}
                                <span className="font-semibold text-lg">{accountStatus}</span>
                            </div>
                        </div>
                    </div>
                     <div className="flex justify-between items-center pt-4">
                        <div className="flex items-center space-x-2 text-sm text-text-secondary">
                            <FireIcon className="h-6 w-6 text-amber-500" />
                            <span className="font-bold text-lg text-text-primary">{daysWithoutViolations === 999 ? 'Perfect' : daysWithoutViolations}</span>
                            <span>Streak</span>
                        </div>
                         <div className="flex items-center space-x-2 text-sm text-text-secondary">
                            <AwardIcon className="h-6 w-6 text-accent" />
                            <span className="font-bold text-lg text-text-primary">{pointLogsWithBadges.length}</span>
                            <span>Total Awards</span>
                        </div>
                    </div>
                </Card>
                 <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <ArrowUpCircleIcon className="h-8 w-8 text-secondary mx-auto mb-2" />
                                <p className="text-2xl font-bold text-text-primary">+{pointsGained}</p>
                                <p className="text-sm text-text-secondary">Points Gained (All Time)</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <ArrowDownCircleIcon className="h-8 w-8 text-danger mx-auto mb-2" />
                                <p className="text-2xl font-bold text-text-primary">-{pointsLost}</p>
                                <p className="text-sm text-text-secondary">Points Lost (All Time)</p>
                            </div>
                        </div>
                    </Card>
                    <Card title="Hall of Fame" icon={<MedalIcon className="w-5 h-5" />}>
                        {pointLogsWithBadges.length > 0 ? <HallOfFame pointLogsWithBadges={pointLogsWithBadges} /> : <p className="text-text-secondary text-center py-4">No badges earned yet.</p>}
                    </Card>
                </div>
            </div>
            <Card title="Recent Activity">
                <ActivityLog points={studentPoints} users={allUsers} />
            </Card>
        </div>
    );
};

const ParentDashboard: React.FC = () => {
    const { user } = useAuth();
    const { selectedYear } = useData();
    const [data, setData] = useState<ParentDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    const fetchParentData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await api.getParentDashboardData({ year: selectedYear });
            setData(result);
            if (result.children.length > 0 && !selectedChildId) {
                setSelectedChildId(result.children[0].id);
            }
        } catch (err) {
            setError("Failed to load your children's data.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [selectedYear, selectedChildId]);

    useEffect(() => {
        if(user) {
            fetchParentData();
        }
    }, [user, fetchParentData]);
    
    const selectedChild = useMemo(() => {
        if (!data) return null;
        return data.children.find(c => c.id === selectedChildId);
    }, [data, selectedChildId]);

    if (loading) return <DashboardSkeleton />;
    if (error) return <div className="text-center text-danger">{error}</div>;
    if (!user || !data) return null;
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-text-primary">Parent Dashboard</h1>
                {data.children.length > 1 && (
                    <div className="flex items-center space-x-2">
                        <label htmlFor="child-select" className="text-sm font-medium text-text-secondary">Viewing:</label>
                         <Select id="child-select" value={selectedChildId || ''} onChange={(e) => setSelectedChildId(e.target.value)}>
                            {data.children.map(child => (
                                <option key={child.id} value={child.id}>{child.name}</option>
                            ))}
                        </Select>
                    </div>
                )}
            </div>
            
            {selectedChild ? (
                <ChildDataView student={selectedChild} allPoints={data.points} allUsers={data.users} />
            ) : (
                <Card>
                    <div className="text-center py-12">
                        <UserCircleIcon className="mx-auto h-12 w-12 text-text-secondary" />
                        <h3 className="mt-2 text-lg font-medium text-text-primary">No Children Found</h3>
                        <p className="mt-1 text-sm text-text-secondary">There are no students linked to your account. Please contact an administrator.</p>
                    </div>
                </Card>
            )}
            <ReportTeacherFooter />
        </div>
    );
};

export default ParentDashboard;
