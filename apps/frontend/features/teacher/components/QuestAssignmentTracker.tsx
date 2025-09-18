import React, { useState, useMemo } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { 
  ClipboardDocumentCheckIcon, 
  UserGroupIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  EyeIcon,
  StarIcon,
  FlagIcon
} from '../../../assets/icons';
import { getAvatarColor, getInitials } from '../../../utils/helpers';
import { Quest, QuestParticipant, QuestCompletionStatus, User, BadgeTier } from '../../../types';
import { BadgeIconRenderer } from '../../shared/BadgeIconRenderer';

interface QuestAssignmentTrackerProps {
  quests: Quest[];
  questParticipants: QuestParticipant[];
  users: User[];
  currentUserId: string;
  onViewDetails: (quest: Quest) => void;
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

const BADGE_COLORS = {
  [BadgeTier.BRONZE]: 'text-amber-600',
  [BadgeTier.SILVER]: 'text-gray-500',
  [BadgeTier.GOLD]: 'text-yellow-600'
};

export const QuestAssignmentTracker: React.FC<QuestAssignmentTrackerProps> = ({
  quests,
  questParticipants,
  users,
  currentUserId,
  onViewDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [participantFilter, setParticipantFilter] = useState<'all' | 'has_participants' | 'no_participants'>('all');
  const [sortBy, setSortBy] = useState<'created' | 'title' | 'participants' | 'expires'>('created');

  // Filter quests supervised by current user
  const supervisedQuests = useMemo(() => {
    return quests.filter(quest => 
      quest.supervisorId === currentUserId && quest.isActive
    );
  }, [quests, currentUserId]);

  // Get quest statistics
  const questStats = useMemo(() => {
    const stats = supervisedQuests.map(quest => {
      const participants = questParticipants.filter(p => p.questId === quest.id);
      const inProgress = participants.filter(p => p.status === QuestCompletionStatus.IN_PROGRESS).length;
      const pendingReview = participants.filter(p => p.status === QuestCompletionStatus.SUBMITTED_FOR_REVIEW).length;
      const completed = participants.filter(p => p.status === QuestCompletionStatus.COMPLETED).length;
      const totalParticipants = participants.length;
      const slotsLeft = quest.slotsAvailable ? quest.slotsAvailable - totalParticipants : Infinity;
      const isExpired = quest.expiresAt ? new Date(quest.expiresAt) < new Date() : false;
      
      return {
        quest,
        participants,
        inProgress,
        pendingReview,
        completed,
        totalParticipants,
        slotsLeft,
        isExpired
      };
    });

    return stats;
  }, [supervisedQuests, questParticipants]);

  // Filter and sort quest stats
  const filteredQuestStats = useMemo(() => {
    let filtered = questStats;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(stat => 
        stat.quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stat.quest.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(stat => !stat.isExpired);
    } else if (statusFilter === 'expired') {
      filtered = filtered.filter(stat => stat.isExpired);
    }

    // Participant filter
    if (participantFilter === 'has_participants') {
      filtered = filtered.filter(stat => stat.totalParticipants > 0);
    } else if (participantFilter === 'no_participants') {
      filtered = filtered.filter(stat => stat.totalParticipants === 0);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.quest.title.localeCompare(b.quest.title);
        case 'participants':
          return b.totalParticipants - a.totalParticipants;
        case 'expires':
          if (!a.quest.expiresAt && !b.quest.expiresAt) return 0;
          if (!a.quest.expiresAt) return 1;
          if (!b.quest.expiresAt) return -1;
          return new Date(a.quest.expiresAt).getTime() - new Date(b.quest.expiresAt).getTime();
        case 'created':
        default:
          return new Date(b.quest.createdAt).getTime() - new Date(a.quest.createdAt).getTime();
      }
    });

    return filtered;
  }, [questStats, searchTerm, statusFilter, participantFilter, sortBy]);

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getParticipantsByStatus = (participants: QuestParticipant[], status: QuestCompletionStatus) => {
    return participants.filter(p => p.status === status);
  };

  const totalQuests = supervisedQuests.length;
  const totalParticipants = questStats.reduce((sum, stat) => sum + stat.totalParticipants, 0);
  const totalPendingReview = questStats.reduce((sum, stat) => sum + stat.pendingReview, 0);
  const totalCompleted = questStats.reduce((sum, stat) => sum + stat.completed, 0);

  return (
    <Card icon={<ClipboardDocumentCheckIcon className="h-5 w-5" />} title="Quest Assignment & Tracking">
      <div className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-secondary rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-text-primary">{totalQuests}</div>
            <div className="text-sm text-text-secondary">Active Quests</div>
          </div>
          <div className="bg-surface-secondary rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalParticipants}</div>
            <div className="text-sm text-text-secondary">Total Participants</div>
          </div>
          <div className="bg-surface-secondary rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{totalPendingReview}</div>
            <div className="text-sm text-text-secondary">Pending Review</div>
          </div>
          <div className="bg-surface-secondary rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalCompleted}</div>
            <div className="text-sm text-text-secondary">Completed</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search quests..."
              className="w-full"
            />
          </div>
          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </Select>
          </div>
          <div>
            <Select
              value={participantFilter}
              onChange={(e) => setParticipantFilter(e.target.value as any)}
              className="w-full"
            >
              <option value="all">All Quests</option>
              <option value="has_participants">With Participants</option>
              <option value="no_participants">No Participants</option>
            </Select>
          </div>
          <div>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full"
            >
              <option value="created">Sort by Created</option>
              <option value="title">Sort by Title</option>
              <option value="participants">Sort by Participants</option>
              <option value="expires">Sort by Expiry</option>
            </Select>
          </div>
        </div>

        {/* Quest List */}
        <div className="space-y-4">
          {filteredQuestStats.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">
              <ClipboardDocumentCheckIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No quests found matching your filters.</p>
            </div>
          ) : (
            filteredQuestStats.map((stat) => {
              const { quest, participants, inProgress, pendingReview, completed, totalParticipants, slotsLeft, isExpired } = stat;
              
              return (
                <div key={quest.id} className="bg-surface-secondary rounded-lg p-6 border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-text-primary">{quest.title}</h3>
                        {quest.badgeTier && (
                          <div className={`flex items-center gap-1 ${BADGE_COLORS[quest.badgeTier]}`}>
                            <BadgeIconRenderer iconName={quest.badgeIcon} className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase">{quest.badgeTier}</span>
                          </div>
                        )}
                        {isExpired && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                            <ExclamationTriangleIcon className="h-3 w-3" />
                            Expired
                          </span>
                        )}
                      </div>
                      
                      <p className="text-text-secondary mb-3 line-clamp-2">{quest.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                        <span className="flex items-center gap-1">
                          <StarIcon className="h-4 w-4" />
                          {quest.points} points
                        </span>
                        <span className="flex items-center gap-1">
                          <UserGroupIcon className="h-4 w-4" />
                          {totalParticipants} participants
                          {quest.slotsAvailable && (
                            <span className="text-xs">({slotsLeft} slots left)</span>
                          )}
                        </span>
                        {quest.expiresAt && (
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            Expires {formatDate(quest.expiresAt)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <FlagIcon className="h-4 w-4" />
                          Created {formatDate(quest.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => onViewDetails(quest)}
                      variant="outline"
                      size="sm"
                      className="ml-4"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>

                  {/* Participant Status Summary */}
                  {totalParticipants > 0 && (
                    <div className="border-t border-border pt-4">
                      <h4 className="font-medium text-text-primary mb-3">Participant Status</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* In Progress */}
                        <div className="bg-surface rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-text-primary">In Progress</span>
                            <span className="text-lg font-bold text-blue-600">{inProgress}</span>
                          </div>
                          {inProgress > 0 && (
                            <div className="space-y-1">
                              {getParticipantsByStatus(participants, QuestCompletionStatus.IN_PROGRESS)
                                .slice(0, 3)
                                .map(participant => {
                                  const student = users.find(u => u.id === participant.studentId);
                                  return student ? (
                                    <div key={participant.studentId} className="flex items-center gap-2 text-xs">
                                      <div 
                                        className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
                                        style={{ backgroundColor: getAvatarColor(student.id) }}
                                      >
                                        {getInitials(student.name || `${student.firstName} ${student.lastName}`)}
                                      </div>
                                      <span className="text-text-secondary truncate">
                                        {student.name || `${student.firstName} ${student.lastName}`}
                                      </span>
                                    </div>
                                  ) : null;
                                })}
                              {inProgress > 3 && (
                                <div className="text-xs text-text-secondary">+{inProgress - 3} more</div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Pending Review */}
                        <div className="bg-surface rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-text-primary">Pending Review</span>
                            <span className="text-lg font-bold text-yellow-600">{pendingReview}</span>
                          </div>
                          {pendingReview > 0 && (
                            <div className="space-y-1">
                              {getParticipantsByStatus(participants, QuestCompletionStatus.SUBMITTED_FOR_REVIEW)
                                .slice(0, 3)
                                .map(participant => {
                                  const student = users.find(u => u.id === participant.studentId);
                                  return student ? (
                                    <div key={participant.studentId} className="flex items-center gap-2 text-xs">
                                      <div 
                                        className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
                                        style={{ backgroundColor: getAvatarColor(student.id) }}
                                      >
                                        {getInitials(student.name || `${student.firstName} ${student.lastName}`)}
                                      </div>
                                      <span className="text-text-secondary truncate">
                                        {student.name || `${student.firstName} ${student.lastName}`}
                                      </span>
                                    </div>
                                  ) : null;
                                })}
                              {pendingReview > 3 && (
                                <div className="text-xs text-text-secondary">+{pendingReview - 3} more</div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Completed */}
                        <div className="bg-surface rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-text-primary">Completed</span>
                            <span className="text-lg font-bold text-green-600">{completed}</span>
                          </div>
                          {completed > 0 && (
                            <div className="space-y-1">
                              {getParticipantsByStatus(participants, QuestCompletionStatus.COMPLETED)
                                .slice(0, 3)
                                .map(participant => {
                                  const student = users.find(u => u.id === participant.studentId);
                                  return student ? (
                                    <div key={participant.studentId} className="flex items-center gap-2 text-xs">
                                      <div 
                                        className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
                                        style={{ backgroundColor: getAvatarColor(student.id) }}
                                      >
                                        {getInitials(student.name || `${student.firstName} ${student.lastName}`)}
                                      </div>
                                      <span className="text-text-secondary truncate">
                                        {student.name || `${student.firstName} ${student.lastName}`}
                                      </span>
                                    </div>
                                  ) : null;
                                })}
                              {completed > 3 && (
                                <div className="text-xs text-text-secondary">+{completed - 3} more</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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