import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Quest, User, QuestParticipant, UserRole } from '../../types';
import { hasAnyRole } from '../../utils/roleUtils';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
// import { HealthMonitor } from '../components/HealthMonitor'; // Temporarily disabled due to missing dependency
import AdminQuestDashboard from './components/AdminQuestDashboard';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

// Stats card component
interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <Card className={`p-6 border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm text-blue-500">{description}</p>
        </div>
      </div>
    </Card>
  );
};

interface AdminDashboardProps {
  className?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const { 
    quests, 
    questParticipants, 
    users, 
    loading: dataLoading, 
    error: dataError,
    refreshData
  } = useData();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'quest-management'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Initialize data loading
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await refreshData();
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [refreshData]);

  // Manual refresh function
  const handleManualRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      await refreshData();
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    const totalQuests = quests?.length || 0;
    const activeQuests = quests?.filter(q => q.isActive).length || 0;
    const totalUsers = users?.length || 0;
    const teachers = users?.filter(u => 
      hasAnyRole(u, [UserRole.TEACHER, UserRole.HEAD_OF_CLASS, 'teacher', 'head_teacher', 'head_of_class']) && !u.isArchived
    ).length || 0;
    const students = users?.filter(u => u.role === UserRole.STUDENT && !u.isArchived).length || 0;
    const totalParticipants = questParticipants?.length || 0;
    const completedQuests = questParticipants?.filter(p => p.status === 'completed').length || 0;

    return {
      totalQuests,
      activeQuests,
      totalUsers,
      teachers,
      students,
      totalParticipants,
      completedQuests
    };
  }, [quests, users, questParticipants]);

  // Handle data refresh
  const handleDataUpdate = async () => {
    try {
      await refreshData();
    } catch (err) {
      setError('Failed to refresh data');
    }
  };

  if (loading || dataLoading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${className || ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || dataError) {
    return (
      <div className={`min-h-screen bg-gray-50 ${className || ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
              <p className="text-gray-600 mb-4">{error || dataError}</p>
              <Button onClick={handleDataUpdate}>Try Again</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className || ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.firstName} {user?.lastName}. Manage your school's quest system.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* <HealthMonitor compact /> */}
            <Button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Data
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('quest-management')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'quest-management'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Quest Management
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Quests"
                value={stats.totalQuests}
                description="All quests in system"
                color="blue"
              />
              <StatsCard
                title="Active Quests"
                value={stats.activeQuests}
                description="Currently available"
                color="green"
              />
              <StatsCard
                title="Teachers"
                value={stats.teachers}
                description="Quest supervisors"
                color="yellow"
              />
              <StatsCard
                title="Students"
                value={stats.students}
                description="Quest participants"
                color="blue"
              />
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Quest Participations"
                value={stats.totalParticipants}
                description="Total enrollments"
                color="green"
              />
              <StatsCard
                title="Completed Quests"
                value={stats.completedQuests}
                description="Successfully finished"
                color="green"
              />
              <StatsCard
                title="Completion Rate"
                value={stats.totalParticipants > 0 ? Math.round((stats.completedQuests / stats.totalParticipants) * 100) : 0}
                description="% of participations completed"
                color={stats.totalParticipants > 0 && (stats.completedQuests / stats.totalParticipants) > 0.7 ? 'green' : 'yellow'}
              />
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                  <span className="text-green-800">Quest System</span>
                  <span className="text-green-600 font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                  <span className="text-blue-800">Teacher Supervision</span>
                  <span className="text-blue-600 font-medium">
                    {stats.teachers} teachers available
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
                  <span className="text-yellow-800">Active Quests</span>
                  <span className="text-yellow-600 font-medium">
                    {stats.activeQuests} quests need supervision
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => setActiveTab('quest-management')}
                  className="flex items-center gap-2"
                >
                  Create New Quest
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDataUpdate}
                >
                  Refresh Data
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'quest-management' && (
          <div id="quest-management">
            <Suspense fallback={<LoadingSpinner />}>
              <AdminQuestDashboard
                onUpdate={handleDataUpdate}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;