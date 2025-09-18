
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/ui/Card';
import { UserRole, PointType, User, PointLog, QuestParticipant, Quest, Appeal } from '../../types';
import * as api from '../../services/api';
import { ClassInsights } from './components/ClassInsights';
import { BronzeAwardManager } from './components/BronzeAwardManager';
import { ProfileEditor } from './components/ProfileEditor';
import { AcademicCapIcon, UserCircleIcon, UserGroupIcon } from '../../assets/icons';
import { PointLogger } from './components/PointLogger';
import { StudentSnapshot } from './components/StudentSnapshot';
import { ClassRoster } from './components/ClassRoster';
import { QuestApprovalWidget } from './components/QuestApprovalWidget';
import { Button } from '../../components/ui/Button';
import { DashboardSkeleton } from '../../components/loading/DashboardSkeleton';
import { hasRole } from '../../utils/roleUtils';

interface TeacherDashboardData {
    students: User[]; // Keep for backward compatibility
    users: User[]; // All users for admin integration
    classes: any[]; // Classes data for proper integration
    teacherReports: any[]; // Teacher reports for integration
    points: PointLog[];
    questParticipants: QuestParticipant[];
    quests: Quest[];
    appeals: Appeal[];
}

const TeacherDashboard: React.FC = () => {
    const { user } = useAuth();
    const { selectedYear } = useData();
    
    const [data, setData] = useState<TeacherDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isHeadTeacher = hasRole(user, UserRole.HEAD_OF_CLASS);
    const [logType, setLogType] = useState<PointType.REWARD | PointType.VIOLATION>(PointType.REWARD);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'myClass' | 'allStudents' | 'profile'>(isHeadTeacher ? 'myClass' : 'allStudents');

    const selectedStudentIdRef = useRef(selectedStudentId);
    selectedStudentIdRef.current = selectedStudentId;

    const fetchTeacherData = useCallback(async () => {
        console.log('TeacherDashboard - fetchTeacherData called');
        console.log('Current user:', user);
        console.log('User roles:', user?.roles);
        
        setLoading(true);
        setError(null);
        try {
            console.log('Making API call to getTeacherDashboardData...');
            const result = await api.getTeacherDashboardData({ year: selectedYear });
            console.log('API response received:', result);
            setData(result);
            // If a student was selected but is no longer in the data (e.g., year change), deselect them.
            if (selectedStudentIdRef.current && !result.students.find((s: User) => s.id === selectedStudentIdRef.current)) {
                setSelectedStudentId(null);
            }
        } catch (err) {
            console.error('API call failed:', err);
            setError('Failed to load dashboard data. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [selectedYear, user]);

    useEffect(() => {
        if(user) {
            fetchTeacherData();
        }
    }, [user, fetchTeacherData]);

    const myClassStudents = useMemo(() => {
        if (!data || !user?.classId) return [];
        return data.students.filter(s => s.classId === user.classId);
    }, [data, user]);

    const allStudents = useMemo(() => {
        if (!data) {
            console.log('TeacherDashboard - No data available');
            return [];
        }
        // Use enhanced user data for admin integration - teachers now have access to all users
        const allUsers = data.users || data.students; // Fallback to students for backward compatibility
        console.log('TeacherDashboard - Raw data structure:', {
            hasData: !!data,
            hasUsers: !!data.users,
            hasStudents: !!data.students,
            usersLength: data.users?.length || 0,
            studentsLength: data.students?.length || 0,
            allUsersLength: allUsers?.length || 0,
            sampleUser: allUsers?.[0] || 'No users'
        });
        
        if (!allUsers || allUsers.length === 0) {
            console.log('TeacherDashboard - No users found in data');
            return [];
        }
        
        // Filter to only include users with student role to prevent teachers from awarding points to other teachers
        const studentsOnly = allUsers.filter(user => {
            // Handle both string array format and object array format for roles
            let hasStudentRole = false;
            if (Array.isArray(user.roles)) {
                hasStudentRole = user.roles.some(role => {
                    if (typeof role === 'string') {
                        return role === 'student';
                    } else if (typeof role === 'object' && role.name) {
                        return role.name === 'student';
                    }
                    return false;
                });
            }
            console.log(`User ${user.firstName} ${user.lastName}:`, {
                roles: user.roles,
                hasStudentRole
            });
            return hasStudentRole;
        });
        console.log('TeacherDashboard - Students filtered:', studentsOnly.length);
        
        // Transform student data to include 'name' field for SearchableSingleUserSelector compatibility
        const transformedStudents = studentsOnly.map(student => ({
            ...student,
            name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email || 'Unknown User'
        }));
        
        // Make sure users are sorted by name for consistent display in selectors
        const sortedStudents = [...transformedStudents].slice().sort((a, b) => {
            const aName = a.firstName || '';
            const bName = b.firstName || '';
            return aName.localeCompare(bName);
        });
        console.log('TeacherDashboard - Final allStudents:', sortedStudents.length, sortedStudents);
        console.log('TeacherDashboard - Sample transformed student:', sortedStudents[0]);
        return sortedStudents;
    }, [data]);

    // Ensure users array is available for components that need it (like PointLogger)
    const allUsers = useMemo(() => {
        if (!data?.users) return allStudents;
        return data.users.map(user => ({
            ...user,
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User'
        }));
    }, [data?.users, allStudents]);
    
    const selectedStudent = useMemo(() => {
        return allStudents.find(s => s.id === selectedStudentId) || null;
    }, [allStudents, selectedStudentId]);
    
    if (loading) return <DashboardSkeleton />;
    if (error || !data) return <div className="text-center text-danger p-8">{error || 'Could not load data.'}</div>;
    if (!user) return null;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary">Welcome back, {user.name}!</h1>

            {isHeadTeacher && (
                <div className="border-b border-border">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button type="button" onClick={() => setActiveTab('myClass')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'myClass' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'}`}>My Class</button>
                        <button type="button" onClick={() => setActiveTab('allStudents')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'allStudents' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'}`}>All Students</button>
                        <button type="button" onClick={() => setActiveTab('profile')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'}`}>My Profile</button>
                    </nav>
                </div>
            )}

            {activeTab === 'myClass' && isHeadTeacher && (
                <div className="space-y-6 animate-fade-in-up">
                    <Card icon={<AcademicCapIcon className="h-6 w-6 text-primary" />} title={`My Class Roster (${user.className})`}>
                       <ClassRoster students={myClassStudents} points={data.points} onUpdate={fetchTeacherData} />
                    </Card>
                    <ClassInsights classStudents={myClassStudents} classPoints={data.points} />
                    <QuestApprovalWidget quests={data.quests} questParticipants={data.questParticipants} users={data.students} appeals={data.appeals} points={data.points} onUpdate={fetchTeacherData} />
                </div>
            )}

            {activeTab === 'allStudents' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
                    <div className="lg:col-span-1 space-y-6">
                        <Card icon={<UserGroupIcon className="h-5 w-5" />} title="Log Points & Medals">
                            <div className="flex space-x-1 rounded-lg bg-slate-100 p-1 mb-4">
                                <Button type="button" size="md" className="w-full" onClick={() => setLogType(PointType.REWARD)} variant={logType === PointType.REWARD ? 'primary' : 'neutral'}>Reward</Button>
                                <Button type="button" size="md" className="w-full" onClick={() => setLogType(PointType.VIOLATION)} variant={logType === PointType.VIOLATION ? 'primary' : 'neutral'}>Violation</Button>
                            </div>
                            <PointLogger students={allStudents} logType={logType} onStudentSelect={setSelectedStudentId} onUpdate={fetchTeacherData} />
                            {selectedStudent && <StudentSnapshot student={selectedStudent} points={data.points} />}
                        </Card>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <BronzeAwardManager students={allStudents} onAward={fetchTeacherData} />
                    </div>
                </div>
            )}

            {activeTab === 'profile' && isHeadTeacher && (
                <div className="animate-fade-in-up">
                    <Card icon={<UserCircleIcon className="h-5 w-5" />} title="Edit My Profile">
                        <ProfileEditor />
                    </Card>
                </div>
            )}

            {!isHeadTeacher && (
                 <QuestApprovalWidget quests={data.quests} questParticipants={data.questParticipants} users={data.students} appeals={data.appeals} points={data.points} onUpdate={fetchTeacherData} />
            )}
        </div>
    );
};

export default TeacherDashboard;
