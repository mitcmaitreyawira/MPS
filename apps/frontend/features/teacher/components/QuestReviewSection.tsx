import React, { useState, useMemo } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { AdvancedSearchFilters, SearchFilters } from '../../../components/AdvancedSearchFilters';
import { 
  ClipboardDocumentCheckIcon, 
  UserCircleIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon,
  StarIcon,
  FlagIcon
} from '../../../assets/icons';
import { getAvatarColor, getInitials } from '../../../utils/helpers';
import { Quest, QuestParticipant, QuestCompletionStatus, User } from '../../../types';
import { BadgeIconRenderer } from '../../shared/BadgeIconRenderer';

interface QuestReviewSectionProps {
  quests: Quest[];
  questParticipants: QuestParticipant[];
  users: User[];
  currentUserId: string;
  onApproveSubmission: (participantId: string, reviewNotes?: string) => Promise<void>;
  onRejectSubmission: (participantId: string, reviewNotes: string) => Promise<void>;
}

interface ReviewModalData {
  participant: QuestParticipant;
  quest: Quest;
  student: User;
  action: 'approve' | 'reject';
}

const STATUS_COLORS = {
  [QuestCompletionStatus.IN_PROGRESS]: 'text-blue-600 bg-blue-100',
  [QuestCompletionStatus.SUBMITTED_FOR_REVIEW]: 'text-yellow-600 bg-yellow-100',
  [QuestCompletionStatus.COMPLETED]: 'text-green-600 bg-green-100'
};

const STATUS_LABELS = {
  [QuestCompletionStatus.IN_PROGRESS]: 'In Progress',
  [QuestCompletionStatus.SUBMITTED_FOR_REVIEW]: 'Pending Review',
  [QuestCompletionStatus.COMPLETED]: 'Completed'
};

export const QuestReviewSection: React.FC<QuestReviewSectionProps> = ({
  quests,
  questParticipants,
  users,
  currentUserId,
  onApproveSubmission,
  onRejectSubmission
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    role: '',
    classId: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    includeArchived: false
  });
  const [questFilter, setQuestFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<QuestCompletionStatus | 'all'>('all');
  const [reviewModal, setReviewModal] = useState<ReviewModalData | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get quests supervised by current user
  const supervisedQuests = useMemo(() => {
    return quests.filter(quest => quest.supervisorId === currentUserId);
  }, [quests, currentUserId]);

  // Get participants for supervised quests
  const supervisedParticipants = useMemo(() => {
    const questIds = supervisedQuests.map(q => q.id);
    return questParticipants.filter(p => questIds.includes(p.questId));
  }, [questParticipants, supervisedQuests]);

  // Filter and sort participants
  const filteredParticipants = useMemo(() => {
    let filtered = supervisedParticipants;

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(participant => {
        const student = users.find(u => u.id === participant.studentId);
        const quest = supervisedQuests.find(q => q.id === participant.questId);
        const studentName = student ? (student.name || `${student.firstName} ${student.lastName}`) : '';
        const questTitle = quest?.title || '';
        
        return studentName.toLowerCase().includes(filters.search.toLowerCase()) ||
               questTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
               student?.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
               student?.nisn?.toLowerCase().includes(filters.search.toLowerCase());
      });
    }

    // Class filter
    if (filters.classId) {
      filtered = filtered.filter(participant => {
        const student = users.find(u => u.id === participant.studentId);
        return student?.classId === filters.classId;
      });
    }

    // Quest filter
    if (questFilter !== 'all') {
      filtered = filtered.filter(p => p.questId === questFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const studentA = users.find(u => u.id === a.studentId);
      const studentB = users.find(u => u.id === b.studentId);
      const questA = supervisedQuests.find(q => q.id === a.questId);
      const questB = supervisedQuests.find(q => q.id === b.questId);
      
      let aValue = '';
      let bValue = '';
      
      switch (filters.sortBy) {
        case 'firstName':
          aValue = studentA?.firstName || '';
          bValue = studentB?.firstName || '';
          break;
        case 'lastName':
          aValue = studentA?.lastName || '';
          bValue = studentB?.lastName || '';
          break;
        case 'email':
          aValue = studentA?.email || '';
          bValue = studentB?.email || '';
          break;
        case 'createdAt':
        default:
          return new Date(b.submittedAt || b.joinedAt).getTime() - new Date(a.submittedAt || a.joinedAt).getTime();
      }
      
      const comparison = aValue.localeCompare(bValue);
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [supervisedParticipants, filters, questFilter, statusFilter, users, supervisedQuests]);

  const formatDateTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReviewAction = (participant: QuestParticipant, action: 'approve' | 'reject') => {
    const quest = supervisedQuests.find(q => q.id === participant.questId);
    const student = users.find(u => u.id === participant.studentId);
    
    if (quest && student) {
      setReviewModal({ participant, quest, student, action });
      setReviewNotes('');
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModal) return;

    setIsSubmitting(true);
    try {
      if (reviewModal.action === 'approve') {
        await onApproveSubmission(reviewModal.participant.id, reviewNotes || undefined);
      } else {
        await onRejectSubmission(reviewModal.participant.id, reviewNotes);
      }
      setReviewModal(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingReviewCount = supervisedParticipants.filter(
    p => p.status === QuestCompletionStatus.SUBMITTED_FOR_REVIEW
  ).length;

  const totalParticipants = supervisedParticipants.length;
  const completedCount = supervisedParticipants.filter(
    p => p.status === QuestCompletionStatus.COMPLETED
  ).length;

  return (
    <>
      <Card icon={<ClipboardDocumentCheckIcon className="h-5 w-5" />} title="Quest Review Center">
        <div className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-secondary rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingReviewCount}</div>
              <div className="text-sm text-text-secondary">Pending Review</div>
            </div>
            <div className="bg-surface-secondary rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{totalParticipants}</div>
              <div className="text-sm text-text-secondary">Total Participants</div>
            </div>
            <div className="bg-surface-secondary rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-text-secondary">Completed</div>
            </div>
          </div>

          {/* Advanced Search Filters */}
          <AdvancedSearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            placeholder="Search students, quests, email, or NISN..."
          />
          
          {/* Additional Quest-specific Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Quest
              </label>
              <Select
                value={questFilter}
                onChange={(e) => setQuestFilter(e.target.value)}
                className="w-full"
              >
                <option key="all" value="all">All Quests</option>
                {supervisedQuests.map(quest => (
                  <option key={quest.id} value={quest.id}>{quest.title}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Status
              </label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full"
              >
                <option key="all" value="all">All Status</option>
                <option key={QuestCompletionStatus.IN_PROGRESS} value={QuestCompletionStatus.IN_PROGRESS}>In Progress</option>
                <option key={QuestCompletionStatus.SUBMITTED_FOR_REVIEW} value={QuestCompletionStatus.SUBMITTED_FOR_REVIEW}>Pending Review</option>
                <option key={QuestCompletionStatus.COMPLETED} value={QuestCompletionStatus.COMPLETED}>Completed</option>
              </Select>
            </div>
          </div>

          {/* Participants List */}
          <div className="space-y-4">
            {filteredParticipants.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <ClipboardDocumentCheckIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No quest participants found matching your filters.</p>
              </div>
            ) : (
              filteredParticipants.map((participant) => {
                const quest = supervisedQuests.find(q => q.id === participant.questId);
                const student = users.find(u => u.id === participant.studentId);
                
                if (!quest || !student) return null;
                
                const studentName = student.name || `${student.firstName} ${student.lastName}`;
                
                return (
                  <div key={participant.id} className="bg-surface-secondary rounded-lg p-6 border border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Student Avatar */}
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: getAvatarColor(student.id) }}
                        >
                          {getInitials(studentName)}
                        </div>
                        
                        {/* Participant Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-text-primary">{studentName}</h3>
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              STATUS_COLORS[participant.status]
                            }`}>
                              {STATUS_LABELS[participant.status]}
                            </span>
                          </div>
                          
                          <div className="mb-3">
                            <h4 className="font-medium text-text-primary mb-1">{quest.title}</h4>
                            <p className="text-sm text-text-secondary line-clamp-2">{quest.description}</p>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                            <span className="flex items-center gap-1">
                              <StarIcon className="h-4 w-4" />
                              {quest.points} points
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              Joined {formatDateTime(participant.joinedAt)}
                            </span>
                            {participant.submittedAt && (
                              <span className="flex items-center gap-1">
                                <FlagIcon className="h-4 w-4" />
                                Submitted {formatDateTime(participant.submittedAt)}
                              </span>
                            )}
                          </div>
                          
                          {/* Submission Notes */}
                          {participant.submissionNotes && (
                            <div className="mt-3 p-3 bg-surface rounded-lg">
                              <h5 className="text-sm font-medium text-text-primary mb-1">Submission Notes:</h5>
                              <p className="text-sm text-text-secondary">{participant.submissionNotes}</p>
                            </div>
                          )}
                          
                          {/* Review Notes */}
                          {participant.reviewNotes && (
                            <div className="mt-3 p-3 bg-surface rounded-lg">
                              <h5 className="text-sm font-medium text-text-primary mb-1">Review Notes:</h5>
                              <p className="text-sm text-text-secondary">{participant.reviewNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        {participant.status === QuestCompletionStatus.SUBMITTED_FOR_REVIEW && (
                          <>
                            <Button
                              onClick={() => handleReviewAction(participant, 'approve')}
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReviewAction(participant, 'reject')}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <XCircleIcon className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Card>

      {/* Review Modal */}
      {reviewModal && (
        <Modal
          isOpen={true}
          onClose={() => setReviewModal(null)}
          title={`${reviewModal.action === 'approve' ? 'Approve' : 'Reject'} Quest Submission`}
        >
          <div className="space-y-4">
            <div className="bg-surface-secondary rounded-lg p-4">
              <h4 className="font-medium text-text-primary mb-2">Submission Details</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Student:</strong> {reviewModal.student.name || `${reviewModal.student.firstName} ${reviewModal.student.lastName}`}</div>
                <div><strong>Quest:</strong> {reviewModal.quest.title}</div>
                <div><strong>Points:</strong> {reviewModal.quest.points}</div>
                {reviewModal.participant.submittedAt && (
                  <div><strong>Submitted:</strong> {formatDateTime(reviewModal.participant.submittedAt)}</div>
                )}
              </div>
              
              {reviewModal.participant.submissionNotes && (
                <div className="mt-3">
                  <strong className="text-sm">Student Notes:</strong>
                  <p className="text-sm text-text-secondary mt-1">{reviewModal.participant.submissionNotes}</p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Review Notes {reviewModal.action === 'reject' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={reviewModal.action === 'approve' 
                  ? 'Optional feedback for the student...' 
                  : 'Please provide feedback on why this submission is being rejected...'}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setReviewModal(null)}
                variant="outline"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReview}
                disabled={isSubmitting || (reviewModal.action === 'reject' && !reviewNotes.trim())}
                className={reviewModal.action === 'approve' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'}
              >
                {isSubmitting ? 'Processing...' : (reviewModal.action === 'approve' ? 'Approve Submission' : 'Reject Submission')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};