
import React, { useState, useMemo, memo, useCallback } from 'react';
import { useData } from '../../../context/DataContext';
import { Quest, User, UserRole, BadgeTier, QuestParticipant } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { PlusCircleIcon, PencilIcon, TrashIcon, CheckCircleIcon, availableIconNames } from '../../../assets/icons';
import SearchableSingleUserSelector from '../../shared/SearchableSingleUserSelector';
import { BadgeIconRenderer } from '../../shared/BadgeIconRenderer';
import { ConfirmationModal } from '../../shared/ConfirmationModal';
import { usePerformanceMonitor } from '../../../hooks/usePerformanceMonitor';

const QuestForm: React.FC<{ quest?: Quest; users: User[]; onDone: () => void }> = memo(({ quest, users, onDone }) => {
    const { createQuest, updateQuest } = useData();
    const [awardBadge, setAwardBadge] = useState(!!quest?.badgeTier);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const formatDateForInput = (date?: Date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        title: quest?.title || '',
        description: quest?.description || '',
        points: quest?.points || 25,
        isActive: quest?.isActive ?? true,
        supervisorId: quest?.supervisorId || '',
        requiredPoints: quest?.requiredPoints || 50,
        badgeTier: quest?.badgeTier || BadgeTier.BRONZE,
        badgeReason: quest?.badgeReason || '',
        badgeIcon: quest?.badgeIcon || '',
        slotsAvailable: quest?.slotsAvailable || '',
        expiresAt: formatDateForInput(quest?.expiresAt),
    });

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

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: (type === 'number' && value) ? Number(value) : value }));
        }
    }, []);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if(!formData.supervisorId){
            setError("Please select a supervising teacher.");
            return;
        }

        setIsLoading(true);

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
        
        if (awardBadge) {
            if (!formData.badgeReason) {
                setError("Please provide a reason/title for the badge.");
                setIsLoading(false);
                return;
            }
            payload.badgeTier = formData.badgeTier;
            payload.badgeReason = formData.badgeReason;
            payload.badgeIcon = formData.badgeIcon || undefined;
        }

        try {
            if (quest) {
                await updateQuest(quest.id, payload);
                setSuccessMessage('Quest updated successfully.');
            } else {
                await createQuest(payload as Omit<Quest, 'id' | 'createdAt' | 'createdBy' | 'academicYear'>);
                setSuccessMessage('Quest created successfully.');
            }
            setIsSuccess(true);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const iconOptions = availableIconNames.map(name => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1'),
        value: name
    }));
    
    if (isSuccess) {
        return (
            <div className="text-center p-4">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-secondary" />
                <h3 className="mt-2 text-lg font-medium text-text-primary">Success!</h3>
                <p className="mt-2 text-sm text-text-secondary">{successMessage}</p>
                <Button onClick={onDone} className="mt-6" variant="secondary">
                    Close
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="title" value={formData.title} onChange={handleChange} placeholder="Quest Title" required />
            <Input name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
            <div className="grid grid-cols-2 gap-4">
                <Input name="points" type="number" value={formData.points} onChange={handleChange} placeholder="Points Reward" required />
                <Input name="requiredPoints" type="number" value={formData.requiredPoints} onChange={handleChange} placeholder="Max. Points to Join" required />
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-text-secondary mb-1 block">Slots Available (Optional)</label>
                    <Input name="slotsAvailable" type="number" min="1" value={formData.slotsAvailable} onChange={handleChange} placeholder="e.g., 10" />
                 </div>
                 <div>
                    <label className="text-xs text-text-secondary mb-1 block">Expires At (Optional)</label>
                    <Input name="expiresAt" type="date" value={formData.expiresAt} onChange={handleChange} />
                 </div>
            </div>
            <div>
                 <label className="block text-sm font-medium text-text-secondary mb-1">Supervising Teacher</label>
                <SearchableSingleUserSelector
                    users={teachers}
                    selectedUserId={formData.supervisorId}
                    onSelectUser={(id) => setFormData(prev => ({ ...prev, supervisorId: id }))}
                    placeholder="Search and select a teacher..."
                    required
                />
            </div>

            <div className="space-y-3 rounded-lg border border-border p-4">
                 <label className="flex items-center space-x-3 cursor-pointer text-text-secondary">
                    <input type="checkbox" checked={awardBadge} onChange={(e) => setAwardBadge(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                    <span>Award a Badge on Completion</span>
                </label>
                {awardBadge && (
                    <div className="space-y-4 pt-3 border-t border-border animate-fade-in-up">
                        <Input name="badgeReason" value={formData.badgeReason} onChange={handleChange} placeholder="Badge Title (e.g., 'Science Fair Champion')" required />
                        <div className="grid grid-cols-2 gap-4">
                             <Select name="badgeTier" value={formData.badgeTier} onChange={handleChange}>
                                {Object.values(BadgeTier).map(tier => <option key={tier} value={tier} className="capitalize">{tier}</option>)}
                            </Select>
                            <Select name="badgeIcon" value={formData.badgeIcon || ''} onChange={handleChange}>
                                <option value="">Default Icon</option>
                                {iconOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}
                            </Select>
                        </div>
                    </div>
                )}
            </div>
            
            <label className="flex items-center space-x-3 cursor-pointer text-text-secondary">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <span>Is Active</span>
            </label>
            {error && <p className={`text-sm text-danger`}>{error}</p>}
            <Button type="submit" className="w-full !mt-6" disabled={isLoading}>
                {isLoading ? (quest ? 'Updating...' : 'Creating...') : (quest ? 'Update Quest' : 'Create Quest')}
            </Button>
        </form>
    );
});

interface QuestManagementProps {
    quests: Quest[];
    questParticipants: QuestParticipant[];
    users: User[];
    onUpdate: () => void;
}

const QuestManagement: React.FC<QuestManagementProps> = memo(({ quests, questParticipants, users, onUpdate }) => {
    const { deleteQuest } = useData();
    usePerformanceMonitor('QuestManagement');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuest, setEditingQuest] = useState<Quest | undefined>(undefined);
    const [deletingQuest, setDeletingQuest] = useState<Quest | null>(null);

    const questDetails = useMemo(() => {
        if (!quests || !questParticipants) return [];
        
        // Create optimized maps for faster lookups
        const participantsByQuest = new Map<string, QuestParticipant[]>();
        const completionsByQuest = new Map<string, number>();
        const userMap = new Map<string, string>();
        
        // Build user map once
        users.forEach(user => {
            userMap.set(user.id, user.name);
        });
        
        // Build participant maps once
        questParticipants.forEach(p => {
            if (!participantsByQuest.has(p.questId)) {
                participantsByQuest.set(p.questId, []);
                completionsByQuest.set(p.questId, 0);
            }
            participantsByQuest.get(p.questId)!.push(p);
            if (p.status === 'completed') {
                completionsByQuest.set(p.questId, (completionsByQuest.get(p.questId) || 0) + 1);
            }
        });
        
        return quests.map(q => {
            const participants = participantsByQuest.get(q.id) || [];
            const slotsLeft = q.slotsAvailable ? q.slotsAvailable - participants.length : Infinity;
            return {
                ...q,
                participants: participants.length,
                completions: completionsByQuest.get(q.id) || 0,
                supervisorName: userMap.get(q.supervisorId) || 'N/A',
                slotsLeft: slotsLeft,
            };
        });
    }, [quests, questParticipants, users]);

    const handleOpenModal = (quest?: Quest) => {
        setEditingQuest(quest);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingQuest(undefined);
        setIsModalOpen(false);
        onUpdate();
    };

    const handleDelete = useCallback(async () => {
        if (!deletingQuest) return;
        await deleteQuest(deletingQuest.id);
        onUpdate();
        setDeletingQuest(null); // Close modal on success
    }, [deletingQuest, deleteQuest, onUpdate]);

    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-semibold text-text-primary">All Quests</h3>
                    <Button onClick={() => handleOpenModal()}><PlusCircleIcon className="h-5 w-5 mr-2" />Add Quest</Button>
                </div>
                <div className="max-h-[32rem] overflow-y-auto">
                    <Table headers={['Title', 'Rewards', 'Limits', 'Participation', 'Status', 'Actions']}>
                        {questDetails.map(quest => (
                            <tr key={quest.id}>
                                <td className="px-6 py-3">
                                    <p className="font-medium text-text-primary">{quest.title}</p>
                                    <p className="text-xs text-text-secondary truncate max-w-xs">{quest.description}</p>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-secondary">{quest.points} pts</span>
                                        {quest.badgeTier && <BadgeIconRenderer badge={{tier: quest.badgeTier, icon: quest.badgeIcon}} className="h-5 w-5" />}
                                    </div>
                                    <p className="text-xs text-text-secondary">Max. {quest.requiredPoints} pts to join</p>
                                </td>
                                 <td className="px-6 py-3 text-xs text-text-secondary">
                                    <p>Slots: {isFinite(quest.slotsLeft) ? `${quest.slotsLeft} left` : 'Unlimited'}</p>
                                    <p>Expires: {quest.expiresAt ? new Date(quest.expiresAt).toLocaleDateString() : 'Never'}</p>
                                 </td>
                                 <td className="px-6 py-3">
                                    <p className="text-sm font-medium">{quest.participants || 0} Joined</p>
                                    <p className="text-xs text-text-secondary">{quest.completions || 0} Completed</p>
                                </td>
                                <td className="px-6 py-3">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${quest.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {quest.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="flex space-x-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenModal(quest)}><PencilIcon className="h-4 w-4" /></Button>
                                        <Button size="sm" variant="danger" onClick={() => setDeletingQuest(quest)}><TrashIcon className="h-4 w-4" /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </Table>
                </div>
            </Card>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingQuest ? 'Edit Quest' : 'Create New Quest'}>
                <QuestForm quest={editingQuest} users={users} onDone={handleCloseModal} />
            </Modal>
            <ConfirmationModal
                isOpen={!!deletingQuest}
                onClose={() => setDeletingQuest(null)}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message={
                    <p className="text-text-secondary mb-6">
                        Are you sure you want to delete the quest "<strong>{deletingQuest?.title}</strong>"? All participant progress for this quest will be lost. This action cannot be undone.
                    </p>
                }
                confirmText="Confirm Delete"
                confirmVariant="danger"
            />
        </>
    );
});

QuestForm.displayName = 'QuestForm';
QuestManagement.displayName = 'QuestManagement';

export default QuestManagement;
