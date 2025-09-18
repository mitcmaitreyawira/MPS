import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Quest, QuestParticipant, User, UserRole, QuestParticipantStatus } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

// Simple icon components
const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

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
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, icon, color = 'blue' }) => {
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
        <div className="text-blue-400">
          {icon}
        </div>
      </div>
    </Card>
  );
};

// Quest details modal
interface QuestDetailsModalProps {
  quest: Quest | null;
  participants: QuestParticipant[];
  users: User[];
  isOpen: boolean;
  onClose: () => void;
  onApproveCompletion: (participantId: string) => void;
}

const QuestDetailsModal: React.FC<QuestDetailsModalProps> = ({
  quest,
  participants,
  users,
  isOpen,
  onClose,
  onApproveCompletion
}) => {
  if (!quest) return null;

  const questParticipants = participants.filter(p => p.questId === quest.id);
  
  const getParticipantName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Quest: ${quest.title}`} size="lg">
      <div className="space-y-6">
        {/* Quest Info */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Quest Details</h4>
          <div className="bg-gray-50 p-4 rounded-md space-y-2">
            <p><span className="font-medium">Description:</span> {quest.description}</p>
            <p><span className="font-medium">Points Reward:</span> {quest.points}</p>
            <p><span className="font-medium">Status:</span> 
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                quest.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {quest.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
            {quest.expiresAt && (
              <p><span className="font-medium">Expires:</span> {new Date(quest.expiresAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        {/* Participants */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Participants ({questParticipants.length})</h4>
          {questParticipants.length === 0 ? (
            <p className="text-gray-500 italic">No students have joined this quest yet.</p>
          ) : (
            <div className="space-y-3">
              {questParticipants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium text-gray-900">
                      {getParticipantName(participant.userId)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Joined: {new Date(participant.joinedAt).toLocaleDateString()}
                    </p>
                    {participant.completedAt && (
                      <p className="text-sm text-gray-500">
                        Completed: {new Date(participant.completedAt).toLocaleDateString()}
                      </p>
                    )}
                    {participant.studentNotes && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Student Notes:</span> {participant.studentNotes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(participant.status)}`}>
                      {participant.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {participant.status === 'completed' && (
                      <Button
                        size="sm"
                        onClick={() => onApproveCompletion(participant.id)}
                        className="flex items-center gap-1"
                      >
                        <CheckIcon className="h-4 w-4" />
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

interface TeacherDashboardProps {
  className?: string;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ className }) => {
  const { user } = useAuth();
  const { 
    quests, 
    questParticipants, 
    users, 
    loading: dataLoading, 
    error: dataError,
    refreshData 
  } = useData();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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

  // Filter quests supervised by this teacher
  const supervisedQuests = useMemo(() => {
    if (!user || !quests) return [];
    return quests.filter(quest => quest.supervisorId === user.id);
  }, [quests, user]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalQuests = supervisedQuests.length;
    const activeQuests = supervisedQuests.filter(q => q.isActive).length;
    const totalParticipants = questParticipants?.filter(p => 
      supervisedQuests.some(q => q.id === p.questId)
    ).length || 0;
    const completedParticipants = questParticipants?.filter(p => 
      supervisedQuests.some(q => q.id === p.questId) && p.status === 'completed'
    ).length || 0;
    const pendingApprovals = questParticipants?.filter(p => 
      supervisedQuests.some(q => q.id === p.questId) && p.status === 'completed'
    ).length || 0;

    return {
      totalQuests,
      activeQuests,
      totalParticipants,
      completedParticipants,
      pendingApprovals
    };
  }, [supervisedQuests, questParticipants]);

  // Handle quest details view
  const handleViewQuest = (quest: Quest) => {
    setSelectedQuest(quest);
    setIsDetailsModalOpen(true);
  };

  // Handle completion approval
  const handleApproveCompletion = async (participantId: string) => {
    try {
      // In a real app, this would make an API call to approve the completion
      console.log('Approving completion for participant:', participantId);
      // For now, just refresh data
      await refreshData();
    } catch (err) {
      setError('Failed to approve completion');
    }
  };

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.firstName} {user?.lastName}. Supervise your assigned quests and approve student completions.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Supervised Quests"
            value={stats.totalQuests}
            description="Total quests assigned"
            icon={<EyeIcon className="h-8 w-8" />}
            color="blue"
          />
          <StatsCard
            title="Active Quests"
            value={stats.activeQuests}
            description="Currently available"
            icon={<ClockIcon className="h-8 w-8" />}
            color="green"
          />
          <StatsCard
            title="Total Participants"
            value={stats.totalParticipants}
            description="Students joined"
            icon={<UsersIcon className="h-8 w-8" />}
            color="yellow"
          />
          <StatsCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            description="Awaiting review"
            icon={<CheckIcon className="h-8 w-8" />}
            color={stats.pendingApprovals > 0 ? 'red' : 'green'}
          />
        </div>

        {/* Supervised Quests */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Supervised Quests</h2>
            <Button onClick={handleDataUpdate} variant="outline">
              Refresh
            </Button>
          </div>
          
          {supervisedQuests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No quests assigned for supervision yet.</p>
              <p className="text-sm text-gray-400">
                Contact your administrator to get assigned to supervise quests.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quest Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {supervisedQuests.map((quest) => {
                    const questParticipantsList = questParticipants?.filter(p => p.questId === quest.id) || [];
                    const completedCount = questParticipantsList.filter(p => p.status === 'completed').length;
                    const pendingCount = questParticipantsList.filter(p => p.status === 'completed').length;
                    
                    return (
                      <tr key={quest.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{quest.title}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">{quest.description}</div>
                            <div className="text-xs text-gray-400">
                              {quest.points} points • Created {new Date(quest.createdAt).toLocaleDateString()}
                            </div>
                            {quest.expiresAt && (
                              <div className="text-xs text-red-500">
                                Expires: {new Date(quest.expiresAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>{questParticipantsList.length} joined</div>
                            <div className="text-gray-500">{completedCount} completed</div>
                            {pendingCount > 0 && (
                              <div className="text-red-600">{pendingCount} pending approval</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            quest.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {quest.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewQuest(quest)}
                            className="flex items-center gap-1"
                          >
                            <EyeIcon className="h-4 w-4" />
                            View Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Quest Details Modal */}
        <QuestDetailsModal
          quest={selectedQuest}
          participants={questParticipants || []}
          users={users || []}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedQuest(null);
          }}
          onApproveCompletion={handleApproveCompletion}
        />
      </div>
    </div>
  );
};

export default TeacherDashboard;