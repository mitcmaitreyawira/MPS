import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { 
  AcademicCapIcon,
  UserGroupIcon,
  StarIcon,
  ClipboardDocumentCheckIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '../../../assets/icons';
import { PointAuditTrail } from './PointAuditTrail';
import { useDebounce } from '../../../hooks/useDebounce';
import { AdvancedSearchFilters, SearchFilters } from '../../../components/AdvancedSearchFilters';

import { QuestAssignmentTracker } from './QuestAssignmentTracker';
import { QuestReviewSection } from './QuestReviewSection';
import { User, Quest, QuestParticipant } from '../../../types';

// Simple student search component
interface StudentSearchProps {
  students: User[];
  onSelectStudent: (student: User) => void;
}

const StudentSearch: React.FC<StudentSearchProps> = ({ students, onSelectStudent }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    role: '',
    classId: '',
    sortBy: 'firstName',
    sortOrder: 'asc',
    includeArchived: false
  });
  const debouncedSearchTerm = useDebounce(filters.search, 300);
  
  const filteredStudents = useMemo(() => {
    let filtered = [...students];
    
    // Search filter
    if (debouncedSearchTerm) {
      filtered = filtered.filter(student => {
        const name = student.name || `${student.firstName} ${student.lastName}`;
        return name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
               student.username?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
               student.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
               student.nisn?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      });
    }
    
    // Class filter
    if (filters.classId) {
      filtered = filtered.filter(student => student.classId === filters.classId);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aValue = '';
      let bValue = '';
      
      switch (filters.sortBy) {
        case 'firstName':
          aValue = a.firstName || '';
          bValue = b.firstName || '';
          break;
        case 'lastName':
          aValue = a.lastName || '';
          bValue = b.lastName || '';
          break;
        case 'email':
          aValue = a.email || '';
          bValue = b.email || '';
          break;
        case 'nisn':
          aValue = a.nisn || '';
          bValue = b.nisn || '';
          break;
        case 'username':
          aValue = a.username || '';
          bValue = b.username || '';
          break;
        default:
          aValue = a.firstName || '';
          bValue = b.firstName || '';
      }
      
      const comparison = aValue.localeCompare(bValue);
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [students, debouncedSearchTerm, filters.classId, filters.sortBy, filters.sortOrder]);
  
  return (
    <Card icon={<UserGroupIcon className="h-5 w-5" />} title="Student Search">
      <div className="space-y-4">
        <AdvancedSearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          placeholder="Search students by name, username, email, or NISN..."
        />
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <UserGroupIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No students found matching your search criteria.</p>
            </div>
          ) : (
            filteredStudents.map(student => {
              const name = student.name || `${student.firstName} ${student.lastName}`;
              return (
                <div
                  key={student.id}
                  onClick={() => onSelectStudent(student)}
                  className="p-3 border border-border rounded-lg hover:bg-surface-secondary cursor-pointer"
                >
                  <div className="font-medium">{name}</div>
                  <div className="text-sm text-text-secondary">{student.username}</div>
                  {student.nisn && (
                    <div className="text-xs text-text-secondary">NISN: {student.nisn}</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
};

// Simple point management component
interface PointManagementProps {
  students: User[];
  onUpdatePoints: (studentId: string, points: number, reason: string, category?: string) => Promise<void>;
}

const PointManagement: React.FC<PointManagementProps> = ({ students, onUpdatePoints }) => {
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !points || !reason) return;
    
    setIsSubmitting(true);
    try {
      await onUpdatePoints(selectedStudent.id, parseInt(points), reason, category || undefined);
      setPoints('');
      setReason('');
      setCategory('');
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error updating points:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card icon={<StarIcon className="h-5 w-5" />} title="Point Management">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Student</label>
          <select
            value={selectedStudent?.id || ''}
            onChange={(e) => {
              const student = students.find(s => s.id === e.target.value);
              setSelectedStudent(student || null);
            }}
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select a student...</option>
            {students.map(student => {
              const name = student.name || `${student.firstName} ${student.lastName}`;
              return (
                <option key={student.id} value={student.id}>{name}</option>
              );
            })}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Points</label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="Enter points (positive or negative)"
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for point adjustment"
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Category (Optional)</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Homework, Participation"
            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Updating...' : 'Update Points'}
        </Button>
      </form>
    </Card>
  );
};

interface TeacherDashboardProps {
  currentUser: User;
  students: User[];
  quests: Quest[];
  questParticipants: QuestParticipant[];
  onUpdatePoints: (studentId: string, points: number, reason: string, category?: string) => Promise<void>;
  onApproveQuestSubmission: (participantId: string, reviewNotes?: string) => Promise<void>;
  onRejectQuestSubmission: (participantId: string, reviewNotes: string) => Promise<void>;
  onViewQuestDetails: (quest: Quest) => void;
}

type DashboardTab = 'overview' | 'students' | 'points' | 'quests' | 'reviews';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  students,
  quests,
  questParticipants,

  onUpdatePoints,
  onApproveQuestSubmission,
  onRejectQuestSubmission,
  onViewQuestDetails
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate dashboard statistics
  const dashboardStats = React.useMemo(() => {
    const supervisedQuests = quests.filter(q => q.supervisorId === currentUser.id && q.isActive);
    const supervisedParticipants = questParticipants.filter(p => 
      supervisedQuests.some(q => q.id === p.questId)
    );
    const pendingReviews = supervisedParticipants.filter(p => 
      p.status === 'SUBMITTED_FOR_REVIEW'
    ).length;
    const totalStudents = students.length;
    const recentPointTransactions = 0; // Placeholder for point transactions
    return {
      totalStudents,
      supervisedQuests: supervisedQuests.length,
      pendingReviews,
      recentPointTransactions,
      totalParticipants: supervisedParticipants.length
    };
  }, [currentUser.id, students, quests, questParticipants]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'students', label: 'Students', icon: UserGroupIcon },
    { id: 'points', label: 'Point Management', icon: StarIcon },
    { id: 'quests', label: 'Quest Tracking', icon: ClipboardDocumentCheckIcon },
    { id: 'reviews', label: 'Quest Reviews', icon: AcademicCapIcon }
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <Card title={`Welcome back, ${currentUser.firstName}!`}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-surface-secondary rounded-lg p-4 text-center">
                  <UserGroupIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-text-primary">{dashboardStats.totalStudents}</div>
                  <div className="text-sm text-text-secondary">Students</div>
                </div>
                <div className="bg-surface-secondary rounded-lg p-4 text-center">
                  <ClipboardDocumentCheckIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-text-primary">{dashboardStats.supervisedQuests}</div>
                  <div className="text-sm text-text-secondary">Active Quests</div>
                </div>
                <div className="bg-surface-secondary rounded-lg p-4 text-center">
                  <AcademicCapIcon className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <div className="text-2xl font-bold text-text-primary">{dashboardStats.pendingReviews}</div>
                  <div className="text-sm text-text-secondary">Pending Reviews</div>
                </div>
                <div className="bg-surface-secondary rounded-lg p-4 text-center">
                  <StarIcon className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-text-primary">{dashboardStats.recentPointTransactions}</div>
                  <div className="text-sm text-text-secondary">Points This Week</div>
                </div>
                <div className="bg-surface-secondary rounded-lg p-4 text-center">
                  <ShieldCheckIcon className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                  <div className="text-2xl font-bold text-text-primary">{dashboardStats.recentPointTransactions}</div>
                  <div className="text-sm text-text-secondary">Recent Transactions</div>
                </div>
                <div className="bg-surface-secondary rounded-lg p-4 text-center">
                  <UserGroupIcon className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                  <div className="text-2xl font-bold text-text-primary">{dashboardStats.totalParticipants}</div>
                  <div className="text-sm text-text-secondary">Quest Participants</div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card title="Quick Actions">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => setActiveTab('students')}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <UserGroupIcon className="h-6 w-6" />
                  <span>Find Students</span>
                </Button>
                <Button
                  onClick={() => setActiveTab('points')}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <StarIcon className="h-6 w-6" />
                  <span>Manage Points</span>
                </Button>

                <Button
                  onClick={() => setActiveTab('reviews')}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2"
                >
                  <AcademicCapIcon className="h-6 w-6" />
                  <span>Review Quests</span>
                </Button>
              </div>
            </Card>

            {/* Recent Activity Preview */}
            {dashboardStats.pendingReviews > 0 && (
              <Card title="Attention Required">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AcademicCapIcon className="h-6 w-6 text-yellow-600" />
                    <div>
                      <h4 className="font-medium text-yellow-800">
                        {dashboardStats.pendingReviews} quest submission{dashboardStats.pendingReviews !== 1 ? 's' : ''} awaiting review
                      </h4>
                      <p className="text-sm text-yellow-700">Students are waiting for your feedback on their quest submissions.</p>
                    </div>
                    <Button
                      onClick={() => setActiveTab('reviews')}
                      size="sm"
                      className="ml-auto"
                    >
                      Review Now
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        );

      case 'students':
        return (
          <StudentSearch
            students={students}
            onSelectStudent={(student) => {
              // Could implement student detail view here
              console.log('Selected student:', student);
            }}
          />
        );

      case 'points':
        return (
          <div className="space-y-6">
            <PointManagement
              students={students}
              onUpdatePoints={onUpdatePoints}
            />
            <PointAuditTrail
              students={students}
              pointTransactions={[]}
              currentUserId={currentUser.id}
            />
          </div>
        );



      case 'quests':
        return (
          <QuestAssignmentTracker
            quests={quests}
            questParticipants={questParticipants}
            users={students}
            currentUserId={currentUser.id}
            onViewDetails={onViewQuestDetails}
          />
        );

      case 'reviews':
        return (
          <QuestReviewSection
            quests={quests}
            questParticipants={questParticipants}
            users={students}
            currentUserId={currentUser.id}
            onApproveSubmission={onApproveQuestSubmission}
            onRejectSubmission={onRejectQuestSubmission}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-surface-secondary border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <AcademicCapIcon className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-semibold text-text-primary">Teacher Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary">Welcome, {currentUser.firstName}</span>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-surface-secondary border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as DashboardTab)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                  {tab.id === 'reviews' && dashboardStats.pendingReviews > 0 && (
                    <span className="ml-1 bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                      {dashboardStats.pendingReviews}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
};