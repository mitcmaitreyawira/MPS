import React, { useMemo, useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserRole, ReportStatus, AppealStatus, User, Quest, ActionPreset, TeacherReport, PointLog, Class, Appeal, QuestParticipant, AuditLog, Award } from '../../types';
import * as api from '../../services/api';
import { StatCard } from './components/StatCard';
import { PointsActivityChart } from './components/PointsActivityChart';
import { NeedsAttentionWidget } from './components/NeedsAttentionWidget';
import { StatsRow } from '../../components/ui/AdminSection';
import { UserGroupIcon, ClipboardDocumentCheckIcon, SparklesIcon, FlagIcon, BuildingLibraryIcon, ScaleIcon } from '../../assets/icons';
import { AcademicYearSelector } from './components/AcademicYearSelector';
import { DashboardSkeleton } from '../../components/loading/DashboardSkeleton';

// Lazy load heavy components for better performance
const UserManagement = lazy(() => import('./components/UserManagement'));
const QuestManagement = lazy(() => import('./components/QuestManagement'));
const AuditLogViewer = lazy(() => import('./components/AuditLogViewer').then(module => ({ default: module.AuditLogViewer })));
const ActionPresetManagement = lazy(() => import('./components/ActionPresetManagement'));
const TeacherReportViewer = lazy(() => import('./components/TeacherReportViewer').then(module => ({ default: module.TeacherReportViewer })));
const ClassManagement = lazy(() => import('./components/ClassManagement').then(module => ({ default: module.ClassManagement })));
const AppealManagerWidget = lazy(() => import('./components/AppealManagerWidget').then(module => ({ default: module.AppealManagerWidget })));
const BulkActionWidget = lazy(() => import('./components/BulkActionWidget').then(module => ({ default: module.BulkActionWidget })));
const SystemHealthWidget = lazy(() => import('./components/SystemHealthWidget').then(module => ({ default: module.SystemHealthWidget })));


const UserRegistration = lazy(() => import('./components/UserRegistration'));
const UnifiedAwardsManagement = lazy(() => import('./components/UnifiedAwardsManagement'));
const RestrictedAdminSection = lazy(() => import('./components/RestrictedAdminSection'));

interface AdminDashboardData {
    users: User[];
    quests: Quest[];
    actionPresets: ActionPreset[];
    teacherReports: TeacherReport[];
    points: PointLog[];
    classes: Class[];
    appeals: Appeal[];
    questParticipants: QuestParticipant[];
    auditLogs: AuditLog[];
    awards?: Award[];
}

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const { isViewingPastYear, selectedYear, refetchSharedData, classes } = useData();

    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const fetchAdminData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Use Promise.allSettled for better error handling and parallel loading
            const result = await api.getAdminDashboardData({ year: selectedYear });
            console.log('AdminDashboard - API result:', {
                hasResult: !!result,
                hasUsers: !!result?.users,
                usersLength: result?.users?.length || 0,
                sampleUser: result?.users?.[0] || 'No users',
                resultKeys: Object.keys(result || {})
            });
            setData(result);
            // Note: Removed refetchSharedData() call to prevent duplicate API requests
            // Classes are already available from DataContext and don't need to be refetched
        } catch (err) {
            setError('Failed to load admin dashboard data.');
            console.error('AdminDashboard - API error:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedYear]);

    useEffect(() => {
        if(user) {
            fetchAdminData();
        }
    }, [user, fetchAdminData]);

    const stats = useMemo(() => {
        if (!data) return { totalUsers: 0, pendingReports: 0, activeQuests: 0, totalPresets: 0, totalClasses: 0, pendingAppeals: 0 };
        return {
            totalUsers: data.users.length,
            pendingReports: data.teacherReports.filter(r => r.status === ReportStatus.NEW).length,
            activeQuests: data.quests.filter(q => q.isActive).length,
            totalPresets: data.actionPresets.filter(p => !p.isArchived).length,
            totalClasses: data.classes.length,
            pendingAppeals: data.appeals.filter(a => a.status === AppealStatus.PENDING).length,
        }
    }, [data]);

    if (loading) return <DashboardSkeleton />;
    if (error) return <div className="text-center text-danger p-8">{error}</div>;
    if (!user || !data) return null;

    const readOnlyClass = isViewingPastYear ? 'pointer-events-none opacity-60' : '';

    return (
        <div className="space-y-6">
            {user.role === UserRole.SUPER_SECRET_ADMIN && (
                <div className="p-4 bg-red-100 border-l-4 border-danger rounded-r-lg">
                    <p className="font-bold text-red-800">SUPER SECRET ADMIN MODE: Actions are not being audited.</p>
                </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-text-primary">Admin Command Center</h1>
                <AcademicYearSelector />
            </div>
            
            <StatsRow>
                <StatCard title="Total Users" value={stats.totalUsers} icon={<UserGroupIcon />} />
                <StatCard title="Total Classes" value={stats.totalClasses} icon={<BuildingLibraryIcon />} />
                <StatCard title="Active Quests" value={stats.activeQuests} icon={<ClipboardDocumentCheckIcon />} />
                <StatCard title="Action Presets" value={stats.totalPresets} icon={<SparklesIcon />} />
                <StatCard title="Pending Reports" value={stats.pendingReports} icon={<FlagIcon />} variant={stats.pendingReports > 0 ? 'warning' : 'default'} />
                <StatCard title="Pending Appeals" value={stats.pendingAppeals} icon={<ScaleIcon />} variant={stats.pendingAppeals > 0 ? 'warning' : 'default'} />
            </StatsRow>

            {/* System Health & Integrity */}
            <div id="system-health">
                <Suspense fallback={<div className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>}>
                    <SystemHealthWidget />
                </Suspense>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <PointsActivityChart points={data.points} />
                </div>
                <NeedsAttentionWidget pendingReports={stats.pendingReports} pendingAppeals={stats.pendingAppeals} />
            </div>

             <div className="grid grid-cols-1 gap-6">
                {isViewingPastYear && (
                     <div className="p-4 bg-amber-100 border-l-4 border-amber-500 rounded-r-lg">
                        <p className="font-bold text-amber-800">You are viewing a past academic year. All management actions are disabled.</p>
                    </div>
                )}
                <div id="bulk-actions" className={readOnlyClass}>
                    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>}>
                        <BulkActionWidget onUpdate={fetchAdminData} />
                    </Suspense>
                </div>

                <div id="user-registration" className={readOnlyClass}>
                    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
                        <UserRegistration users={data.users} classes={classes} onUpdate={fetchAdminData} />
                    </Suspense>
                </div>
                
                <div id="user-management" className={readOnlyClass}>
                    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
                        <UserManagement users={data.users} classes={classes} points={data.points} onUpdate={fetchAdminData} />
                    </Suspense>
                </div>
                <div id="class-management" className={readOnlyClass}>
                    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>}>
                        <ClassManagement onUpdate={refetchSharedData} />
                    </Suspense>
                </div>
                
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${readOnlyClass}`}>
                    <div id="quest-management">
                        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
                            <QuestManagement quests={data.quests} questParticipants={data.questParticipants} users={data.users} onUpdate={fetchAdminData} />
                        </Suspense>
                    </div>
                    <div id="preset-management">
                        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
                            <ActionPresetManagement onUpdate={fetchAdminData} />
                        </Suspense>
                    </div>
                </div>

                <div id="awards-management" className={readOnlyClass}>
                    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
                        <UnifiedAwardsManagement onUpdate={fetchAdminData} />
                    </Suspense>
                </div>





                <div id="appeal-manager" className={readOnlyClass}>
                    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
                        <AppealManagerWidget appeals={data.appeals} users={data.users} points={data.points} onUpdate={fetchAdminData} />
                    </Suspense>
                </div>
                <div id="teacher-reports" className={readOnlyClass}>
                    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
                        <TeacherReportViewer reports={data.teacherReports} users={data.users} onUpdate={fetchAdminData} />
                    </Suspense>
                </div>
                {user.role === UserRole.ADMIN && (
                    <div id="audit-log">
                        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>}>
                            <AuditLogViewer logs={data.auditLogs} />
                        </Suspense>
                    </div>
                )}

                {/* Restricted Admin Section - Only accessible by scrolling down */}
                {user.role === UserRole.ADMIN && (
                    <div id="restricted-admin-section" className="mt-16">
                        <Suspense fallback={<div className="animate-pulse bg-red-200 h-64 rounded-lg border-4 border-red-500"></div>}>
                            <RestrictedAdminSection 
                                users={data.users} 
                                classes={data.classes} 
                                awards={data.awards} 
                                onUpdate={fetchAdminData} 
                            />
                        </Suspense>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;