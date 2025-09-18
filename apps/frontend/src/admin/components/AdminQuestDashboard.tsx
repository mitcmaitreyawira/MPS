import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Quest, User, UserRole, QuestParticipant, BadgeTier } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
// Simple icon components
const PlusCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

// Simple confirmation modal component
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText: string;
  variant?: 'danger' | 'primary';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  variant = 'primary'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="mb-6">{message}</div>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant={variant === 'danger' ? 'danger' : 'primary'} 
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface AdminQuestDashboardProps {
  onUpdate?: () => void;
}

const AdminQuestDashboard: React.FC<AdminQuestDashboardProps> = ({ onUpdate }) => {
  const { user } = useAuth();
  const { createQuest, updateQuest, deleteQuest } = useData();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [questParticipants, setQuestParticipants] = useState<QuestParticipant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [deletingQuest, setDeletingQuest] = useState<Quest | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points: 25,
    supervisorId: '',
    requiredPoints: 50,
    isActive: true,
    slotsAvailable: '',
    expiresAt: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // In a real app, these would be API calls
        // For now, we'll use empty arrays and let the parent component provide data
        setQuests([]);
        setQuestParticipants([]);
        setUsers([]);
      } catch (err) {
        setError('Failed to load quest data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter teachers for supervisor selection
  const teachers = useMemo(() => {
    return users.filter(u => {
      // Check roles array first (new format)
      if (Array.isArray(u.roles)) {
        const hasTeacherRole = u.roles.some(role => 
          role === 'teacher' || role === 'head_teacher' || role === 'head_of_class'
        );
        return hasTeacherRole && !u.isArchived;
      }
      // Fallback to single role property (backward compatibility)
      if (u.role) {
        return (u.role === UserRole.TEACHER || u.role === UserRole.HEAD_OF_CLASS) && !u.isArchived;
      }
      return false;
    });
  }, [users]);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      points: 25,
      supervisorId: '',
      requiredPoints: 50,
      isActive: true,
      slotsAvailable: '',
      expiresAt: ''
    });

    setEditingQuest(null);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: (type === 'number' && value) ? Number(value) : value 
      }));
    }
  };

  // Open create modal
  const handleCreateQuest = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  // Open edit modal
  const handleEditQuest = (quest: Quest) => {
    setFormData({
      title: quest.title,
      description: quest.description,
      points: quest.points,
      supervisorId: quest.supervisorId || '',
      requiredPoints: quest.requiredPoints || 50,
      isActive: quest.isActive,
      slotsAvailable: quest.slotsAvailable?.toString() || '',
      expiresAt: quest.expiresAt ? new Date(quest.expiresAt).toISOString().split('T')[0] : ''
    });

    setEditingQuest(quest);
    setIsCreateModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supervisorId) {
      setError('Please select a supervising teacher.');
      return;
    }
    
    if (!formData.title.trim()) {
      setError('Please enter a quest title.');
      return;
    }
    


    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Partial<Quest> = {
        title: formData.title,
        description: formData.description,
        points: formData.points,
        isActive: formData.isActive,
        supervisorId: formData.supervisorId,
        requiredPoints: formData.requiredPoints,
        slotsAvailable: formData.slotsAvailable ? Number(formData.slotsAvailable) : undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
      };
      


      if (editingQuest) {
        await updateQuest(editingQuest.id, payload);
      } else {
        await createQuest(payload as Omit<Quest, 'id' | 'createdAt' | 'createdBy' | 'academicYear'>);
      }
      
      setIsCreateModalOpen(false);
      resetForm();
      onUpdate?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle quest deletion
  const handleDeleteQuest = async () => {
    if (!deletingQuest) return;
    
    try {
      await deleteQuest(deletingQuest.id);
      setDeletingQuest(null);
      onUpdate?.();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Get supervisor name
  const getSupervisorName = (supervisorId: string) => {
    const supervisor = users.find(u => u.id === supervisorId);
    return supervisor ? `${supervisor.firstName} ${supervisor.lastName}` : 'Unknown';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Quest Management</h2>
          <Button onClick={handleCreateQuest} className="flex items-center gap-2">
            <PlusCircleIcon className="h-5 w-5" />
            Create Quest
          </Button>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        <p className="text-gray-600">
          Create and manage quests that teachers can supervise. Each quest must have an assigned teacher supervisor.
        </p>
      </Card>

      {/* Quest List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">All Quests ({quests.length})</h3>
        
        {quests.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No quests created yet.</p>
            <Button onClick={handleCreateQuest} variant="outline">
              Create Your First Quest
            </Button>
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
                    Supervisor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points & Requirements
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
                {quests.map((quest) => {
                  const participantCount = questParticipants.filter(p => p.questId === quest.id).length;
                  const completedCount = questParticipants.filter(p => 
                    p.questId === quest.id && p.status === 'completed'
                  ).length;
                  
                  return (
                    <tr key={quest.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{quest.title}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{quest.description}</div>
                          {quest.expiresAt && (
                            <div className="text-xs text-gray-400">
                              Expires: {new Date(quest.expiresAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {getSupervisorName(quest.supervisorId || '')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Reward: {quest.points} points</div>
                          <div className="text-gray-500">Max {quest.requiredPoints} pts to join</div>
                          {quest.slotsAvailable && (
                            <div className="text-gray-500">
                              Slots: {quest.slotsAvailable - participantCount} left
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            quest.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {quest.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {participantCount} joined, {completedCount} completed
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditQuest(quest)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setDeletingQuest(quest)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create/Edit Quest Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
          setError(null);
        }}
        title={editingQuest ? 'Edit Quest' : 'Create New Quest'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quest Title *
            </label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter quest title"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Input
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what students need to do"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Points Reward
              </label>
              <Input
                name="points"
                type="number"
                value={formData.points}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Points (Max to Join)
              </label>
              <Input
                name="requiredPoints"
                type="number"
                value={formData.requiredPoints}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supervising Teacher *
            </label>
            <Select
              name="supervisorId"
              value={formData.supervisorId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a teacher...</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName} ({teacher.role})
                </option>
              ))}
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Slots (Optional)
              </label>
              <Input
                name="slotsAvailable"
                type="number"
                value={formData.slotsAvailable}
                onChange={handleInputChange}
                placeholder="Leave empty for unlimited"
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires On (Optional)
              </label>
              <Input
                name="expiresAt"
                type="date"
                value={formData.expiresAt}
                onChange={handleInputChange}
              />
            </div>
          </div>
          

          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Quest is active (students can join)
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (editingQuest ? 'Updating...' : 'Creating...') 
                : (editingQuest ? 'Update Quest' : 'Create Quest')
              }
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingQuest}
        onClose={() => setDeletingQuest(null)}
        onConfirm={handleDeleteQuest}
        title="Delete Quest"
        message={
          <p>
            Are you sure you want to delete the quest "<strong>{deletingQuest?.title}</strong>"? 
            All participant progress will be lost. This action cannot be undone.
          </p>
        }
        confirmText="Delete Quest"
        variant="danger"
      />
    </div>
  );
};

export default AdminQuestDashboard;