
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { PointType, UserRole, Quest, BadgeTier, QuestParticipant, QuestCompletionStatus, PointLog, User, Appeal, TeacherReport, Award } from '../../types';
import * as api from '../../services/api';
import { MedalIcon, ChartBarIcon, CheckCircleIcon, ExclamationTriangleIcon, ShieldExclamationIcon, AcademicCapIcon } from '../../assets/icons';
import { CircleProgress } from '../shared/CircleProgress';
import ActivityLog from '../shared/ActivityLog';
import QuestItem from './components/QuestItem';
import { HallOfFame } from './components/HallOfFame';
import { LeaderboardList } from './components/LeaderboardList';
import ReportTeacherFooter from '../shared/ReportTeacherFooter';
import { AppealModal } from './components/AppealModal';
import { SubmissionsTracker } from './components/SubmissionsTracker';
import { Card } from '../../components/ui/Card';
import { DashboardCard } from '../../components/ui/DashboardCard';
import { Button } from '../../components/ui/Button';
import { ConfirmationModal } from '../shared/ConfirmationModal';
import { DashboardSkeleton } from '../../components/loading/DashboardSkeleton';
import { calculateStudentStats } from '../../utils/studentStats';
import StudentStatsDisplay from '../admin/components/StudentStatsDisplay';
import NotificationBell from '../shared/NotificationBell';

interface StudentDashboardData {
    points: PointLog[];
    quests: Quest[];
    questParticipants: QuestParticipant[];
    leaderboardUsers: User[];
    classLeaderboardUsers?: User[];
    appeals: Appeal[];
    teacherReports: TeacherReport[];
    awards: Award[];
    userClass?: { id: string; name: string; } | null;
}

const StudentDashboard: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const { joinQuest, submitQuestForReview, submitAppeal } = useData();

    const [data, setData] = useState<StudentDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [awards, setAwards] = useState<Award[]>([]);

    const [questTab, setQuestTab] = useState('available');
    const [leaderboardTab, setLeaderboardTab] = useState('streak');
    const [leaderboardScope, setLeaderboardScope] = useState('school'); // 'school' or 'class'

    
    const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
    const [appealingPointLogId, setAppealingPointLogId] = useState<string | null>(null);
    const [confirmingQuestSubmission, setConfirmingQuestSubmission] = useState<string | null>(null);
    const [confirmingJoinQuest, setConfirmingJoinQuest] = useState<Quest | null>(null);
    const [joiningQuestId, setJoiningQuestId] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async () => {
        // Don't fetch data if user is not available yet
        if (!user?.id) {
            console.log('StudentDashboard: User not available yet, skipping data fetch');
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            const dashboardData = await api.getStudentDashboardData();
            setData(dashboardData);
            
            // Fetch awards for the current student
            try {
                const awardsResponse = await api.getAwardsByRecipient(user.id);
                setAwards(awardsResponse.awards);
            } catch (awardsErr) {
                // Handle authorization errors gracefully for awards
                if ((awardsErr as any).status === 403) {
                    console.warn('StudentDashboard: Insufficient role permissions for awards - continuing without awards');
                    setAwards([]);
                } else {
                    console.error('Failed to fetch awards:', awardsErr);
                    setAwards([]);
                }
            }
        } catch (err) {
            // Handle authorization errors gracefully for dashboard data
            if ((err as any).status === 403) {
                console.warn('StudentDashboard: Insufficient role permissions for dashboard data');
                setError('You do not have permission to access this dashboard. Please contact your administrator.');
            } else {
                setError('Failed to load dashboard data. Please try again later.');
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);
    
    const handleJoinQuest = async () => {
        if (!confirmingJoinQuest) return;
        
        setJoiningQuestId(confirmingJoinQuest.id);
        try {
            await joinQuest(confirmingJoinQuest.id);
            await fetchDashboardData(); // Refetch all data to show quest in "Ongoing"
            setConfirmingJoinQuest(null); // Close modal on success
        } catch (error) {
            // Error will be displayed by the ConfirmationModal component
            // Don't close the modal so user can see the error and try again
            console.error('Failed to join quest:', error);
        } finally {
            setJoiningQuestId(null);
        }
    };
    
    const handleSubmitQuest = async () => {
        if(!confirmingQuestSubmission) return;
        await submitQuestForReview(confirmingQuestSubmission);
        await fetchDashboardData();
        setConfirmingQuestSubmission(null); // Close modal on success
    };
    
    const handleAppealSubmit = async (appealData: Pick<Appeal, 'pointLogId' | 'reason'>) => {
        await submitAppeal(appealData);
        // Refetch data to update the submissions tracker
        await fetchDashboardData();
    };


    const studentPoints = useMemo(() => data?.points || [], [data]);

    // Use shared statistics calculation utility
    const studentStats = useMemo(() => {
        if (!user) return null;
        return calculateStudentStats(user.id, studentPoints);
    }, [user, studentPoints]);

    const totalPoints = useMemo(() => {
        // Students start with 100 points and are capped at 100 maximum
        return Math.max(0, Math.min(100, studentStats?.totalPoints || 0));
    }, [studentStats]);
    
    // displayPoints is capped at 100 to maintain the point system integrity
    const displayPoints = totalPoints;

    const { pointsGained, pointsLost, accountStatus, statusColor, statusIcon } = useMemo(() => {
        if (!studentStats) {
            return { pointsGained: 0, pointsLost: 0, accountStatus: 'Safe', statusColor: 'text-secondary', statusIcon: <CheckCircleIcon className="w-5 h-5"/> };
        }
        
        const gained = studentStats.pointsByType.reward + studentStats.pointsByType.quest + studentStats.pointsByType.appeal_reversal + studentStats.pointsByType.override;
        const lost = Math.abs(studentStats.pointsByType.violation);
        
        let status = 'Safe';
        let color = 'text-secondary';
        let icon = <CheckCircleIcon className="w-5 h-5"/>;
        
        // Status is based on the "health" of the 100-point buffer, represented by displayPoints.
        if (displayPoints < 70) {
            status = 'At Risk';
            color = 'text-danger';
            icon = <ShieldExclamationIcon className="w-5 h-5"/>;
        } else if (displayPoints < 80) {
            status = 'Warning';
            color = 'text-warning';
            icon = <ExclamationTriangleIcon className="w-5 h-5"/>;
        }

        return { pointsGained: gained, pointsLost: lost, accountStatus: status, statusColor: color, statusIcon: icon };
    }, [studentStats, displayPoints]);
    
    // Sort awards by tier (Gold first, then Silver, then Bronze)
    const sortedAwards = useMemo(() => {
        return awards.sort((a, b) => {
            const tierOrder = { 'gold': 0, 'silver': 1, 'bronze': 2 };
            return tierOrder[a.tier] - tierOrder[b.tier];
        });
    }, [awards]);

    // Get streak from backend API (leaderboard data includes correct streak calculation)
    const daysWithoutViolations = useMemo(() => {
        if (!data?.leaderboardUsers || !user?.id) return 0;
        
        // Find current user in leaderboard data to get backend-calculated streak
        const currentUserInLeaderboard = data.leaderboardUsers.find(u => u.id === user.id);
        return currentUserInLeaderboard?.streak || 0;
    }, [data?.leaderboardUsers, user?.id]);

    const { availableQuests, ongoingQuests } = useMemo(() => {
        if (!data) return { availableQuests: [], ongoingQuests: [] };
        const participantQuestIds = new Set(data.questParticipants.map(p => p.questId));
        return {
            availableQuests: data.quests.filter(q => q.isActive && !participantQuestIds.has(q.id)),
            ongoingQuests: data.questParticipants.filter(p => 
                p.status === 'in_progress' || 
                p.status === 'submitted_for_review' || 
                p.status === 'completed'
            )
        };
    }, [data]);
    
    if (loading) return <DashboardSkeleton />;
    if (error || !data) return <div className="text-center text-danger">{error || 'Could not load data.'}</div>;
    if (!user) return null;

    const leaderboardData = data.leaderboardUsers || [];
    
    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="container mx-auto px-4 py-6 space-y-6">
                    {/* Enhanced Header Section */}
                    <div className="bg-white rounded-2xl shadow-lg border border-blue-200 p-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm aspect-square flex-shrink-0">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h1 className="text-2xl lg:text-3xl font-bold text-blue-900">Welcome back, {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name}</h1>
                                        <p className="text-blue-700">{user.nisn} - {user.role}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2 text-sm bg-blue-100 px-4 py-2 rounded-lg">
                                    <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                                    <span className="text-blue-700">Class: <strong className="text-blue-900">{data?.userClass?.name || 'N/A'}</strong></span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-lg">
                                    <span className="text-green-700">Points: <strong className="text-green-800">{totalPoints}/100</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                        {/* Left Column: Progress & Stats */}
                        <div className="xl:col-span-1 space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg border border-indigo-200 p-6">
                                <div className="relative w-max mx-auto mb-6">
                                    <CircleProgress goal={100} points={displayPoints} size={200} strokeWidth={16} />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <span className="text-4xl lg:text-5xl font-bold text-indigo-900">{totalPoints}</span>
                                        <span className="text-sm text-indigo-600 mb-2">/ 100 Points</span>
                                        <div className={`flex items-center space-x-2 ${statusColor}`}>
                                            {statusIcon}
                                            <span className="font-semibold text-sm">{accountStatus}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="bg-green-50 rounded-xl p-3">
                                        <p className="text-xl font-bold text-green-600">+{pointsGained}</p>
                                        <p className="text-xs text-green-700">Earned</p>
                                    </div>
                                    <div className="bg-red-50 rounded-xl p-3">
                                        <p className="text-xl font-bold text-red-600">-{pointsLost}</p>
                                        <p className="text-xs text-red-700">Lost</p>
                                    </div>
                                    <div className="bg-amber-50 rounded-xl p-2">
                                        <p className="text-xl font-bold text-amber-600">{daysWithoutViolations}</p>
                                        <p className="text-xs text-amber-700">Streak</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Quick Shortcuts Section */}
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Access</h3>
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                    <button 
                                        onClick={() => document.getElementById('leaderboard-section')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="flex-shrink-0 flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200"
                                    >
                                        <ChartBarIcon className="w-4 h-4" />
                                        Leaderboard
                                    </button>
                                    <button 
                                        onClick={() => document.getElementById('quests-section')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="flex-shrink-0 flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200"
                                    >
                                        <CheckCircleIcon className="w-4 h-4" />
                                        Quests
                                    </button>
                                    <button 
                                        onClick={() => document.getElementById('awards-section')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="flex-shrink-0 flex items-center gap-2 bg-pink-50 hover:bg-pink-100 text-pink-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200"
                                    >
                                        <MedalIcon className="w-4 h-4" />
                                        Awards
                                    </button>
                                    <button 
                                        onClick={() => document.getElementById('activity-section')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="flex-shrink-0 flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200"
                                    >
                                        <ChartBarIcon className="w-4 h-4" />
                                        Activity
                                    </button>
                                    <button 
                                        onClick={() => document.getElementById('submissions-section')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="flex-shrink-0 flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200"
                                    >
                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                        Submissions
                                    </button>
                                </div>
                            </div>
                            
                            {/* Detailed Student Statistics */}
                            {user && (
                                <StudentStatsDisplay user={user} points={studentPoints} awards={awards} />
                            )}
                            
                            <div id="submissions-section" className="bg-white rounded-2xl shadow-lg border border-purple-200">
                                <SubmissionsTracker appeals={data.appeals} teacherReports={data.teacherReports} points={data.points} onUpdate={fetchDashboardData} />
                            </div>
                    </div>

                        {/* Right Column: Leaderboard & Quests */}
                        <div className="xl:col-span-3 space-y-6">
                            <DashboardCard 
                                title="Leaderboard" 
                                icon={<ChartBarIcon className="w-6 h-6" />}
                                variant="default"
                                id="leaderboard-section"
                            >
                                {/* Scope Toggle */}
                                {data.classLeaderboardUsers && data.classLeaderboardUsers.length > 0 && (
                                    <div className="flex space-x-1 rounded-xl bg-green-100 p-1 mb-4">
                                        <Button size="sm" className="flex-1" onClick={() => setLeaderboardScope('school')} variant={leaderboardScope === 'school' ? 'primary' : 'neutral'}>School</Button>
                                        <Button size="sm" className="flex-1" onClick={() => setLeaderboardScope('class')} variant={leaderboardScope === 'class' ? 'primary' : 'neutral'}>Class</Button>
                                    </div>
                                )}
                                {/* Metric Toggle */}
                                <div className="flex space-x-1 rounded-xl bg-blue-100 p-1 mb-6 overflow-x-auto">
                                    <Button size="sm" className="flex-1 whitespace-nowrap" onClick={() => setLeaderboardTab('streak')} variant={leaderboardTab === 'streak' ? 'primary' : 'neutral'}>Top Streak</Button>
                                    <Button size="sm" className="flex-1 whitespace-nowrap" onClick={() => setLeaderboardTab('awards')} variant={leaderboardTab === 'awards' ? 'primary' : 'neutral'}>Top Awards</Button>
                                </div>
                                {leaderboardTab === 'streak' ? (
                                    <LeaderboardList data={[...(leaderboardScope === 'class' && data.classLeaderboardUsers ? data.classLeaderboardUsers : leaderboardData)].sort((a,b) => (b.streak || 0) - (a.streak || 0)).map(user => ({ student: user, streak: user.streak || 0 }))} valueKey="streak" unit="days" currentUser={user} />
                                ) : (
                                    <LeaderboardList data={[...(leaderboardScope === 'class' && data.classLeaderboardUsers ? data.classLeaderboardUsers : leaderboardData)].sort((a,b) => (b.awardPoints || 0) - (a.awardPoints || 0)).map(user => ({ student: user, awardPoints: user.awardPoints || 0 }))} valueKey="awardPoints" unit="pts" currentUser={user} />
                                )}
                            </DashboardCard>
                            <DashboardCard 
                                title="Quests" 
                                icon={<CheckCircleIcon className="w-6 h-6" />}
                                variant="default"
                                id="quests-section"
                            >
                                <div className="flex space-x-1 rounded-xl bg-indigo-100 p-1 mb-6">
                                    <Button size="md" className="w-full" onClick={() => setQuestTab('available')} variant={questTab === 'available' ? 'primary' : 'neutral'}>Available Quests ({availableQuests.length})</Button>
                                    <Button size="md" className="w-full" onClick={() => setQuestTab('ongoing')} variant={questTab === 'ongoing' ? 'primary' : 'neutral'}>My Quests ({ongoingQuests.length})</Button>
                                </div>
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {questTab === 'available' ? (
                                        availableQuests.length > 0 ? availableQuests.map(quest => (
                                            <QuestItem key={quest.id} quest={quest} onAccept={() => setConfirmingJoinQuest(quest)} studentTotalPoints={totalPoints} allParticipants={data.questParticipants} isJoining={joiningQuestId === quest.id} />
                                        )) : <p className="text-center text-indigo-500 py-8">No new quests are available.</p>
                                    ) : (
                                        ongoingQuests.length > 0 ? ongoingQuests.map(p => {
                                            const quest = data.quests.find(q => q.id === p.questId);
                                            if (!quest) return null;
                                            return <QuestItem key={p.questId} quest={quest} participantInfo={p} onSubmit={() => setConfirmingQuestSubmission(quest.id)} />;
                                        }) : <p className="text-center text-indigo-500 py-8">You haven't joined any quests.</p>
                                    )}
                                </div>
                            </DashboardCard>
                        </div>
                    </div>

                    {/* Hall of Fame */}
                    <div id="awards-section" className="bg-white rounded-2xl shadow-lg border border-pink-200 transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1">
                        <div className="p-6 min-h-fit">
                             {sortedAwards.length > 0 ? (
                                 <div className="w-full overflow-visible">
                                     <HallOfFame 
                                         awards={sortedAwards}
                                     />
                                 </div>
                             ) : (
                                 <div className="text-center py-8">
                                     <p className="text-pink-500 mb-2">
                                         No awards earned yet. Complete quests and excel in your studies to earn your first award!
                                     </p>
                                     <p className="text-pink-400 text-sm">
                                         Get a awards to collect more and show off to your friends #hollyairball
                                     </p>
                                 </div>
                             )}
                         </div>
                    </div>

                    {/* Recent Activity */}
                    <DashboardCard 
                        title="Recent Activity" 
                        icon={<ChartBarIcon className="w-6 h-6" />}
                        variant="default"
                        id="activity-section"
                    >
                        <ActivityLog 
                            points={studentPoints} 
                            users={data.leaderboardUsers}
                            appeals={data.appeals}
                            onAppealRequest={(id) => { setAppealingPointLogId(id); setIsAppealModalOpen(true); }} 
                        />
                    </DashboardCard>

                    <div className="mt-8">
                        <ReportTeacherFooter />
                    </div>
                </div>
            </div>

            <AppealModal
                isOpen={isAppealModalOpen}
                onClose={() => setIsAppealModalOpen(false)}
                pointLogId={appealingPointLogId || ''}
                onSubmitAppeal={handleAppealSubmit}
            />
            
            <ConfirmationModal
                isOpen={!!confirmingJoinQuest}
                onClose={() => setConfirmingJoinQuest(null)}
                onConfirm={handleJoinQuest}
                title={`Confirm Join Quest`}
                message={<p>Are you sure you want to join the quest "<strong>{confirmingJoinQuest?.title}</strong>"?</p>}
                confirmText="Join Quest"
                confirmVariant="secondary"
            />

            <ConfirmationModal
                isOpen={!!confirmingQuestSubmission}
                onClose={() => setConfirmingQuestSubmission(null)}
                onConfirm={handleSubmitQuest}
                title="Confirm Quest Submission"
                message="Are you sure you want to submit this quest for review? You cannot make changes after submitting."
                confirmText="Submit for Review"
                confirmVariant="secondary"
            />
        </>
    );
};

export default StudentDashboard;
