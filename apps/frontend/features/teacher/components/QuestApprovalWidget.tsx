
import React, { useMemo, useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/ui/Card';
import { QuestCompletionStatus, AppealStatus, User, Quest, QuestParticipant, Appeal, PointLog, UserRole } from '../../../types';
import { ClipboardDocumentCheckIcon, ChevronDownIcon, ScaleIcon, CheckCircleIcon, XCircleIcon } from '../../../assets/icons';
import { getAvatarColor, getInitials } from '../../../utils/helpers';
import { Button } from '../../../components/ui/Button';
import { BadgeIconRenderer } from '../../shared/BadgeIconRenderer';
import { ConfirmationModal } from '../../shared/ConfirmationModal';
import { Modal } from '../../../components/ui/Modal';

type ActionItemType = 'quest' | 'appeal';
interface BaseActionItem {
    id: string;
    type: ActionItemType;
    submittedAt: Date;
    student?: User;
}
interface QuestActionItem extends BaseActionItem {
    type: 'quest';
    data: QuestParticipant & { quest: Quest };
}
interface AppealActionItem extends BaseActionItem {
    type: 'appeal';
    data: Appeal & { originalLog?: PointLog };
}
type ActionItem = QuestActionItem | AppealActionItem;

const RejectionModal: React.FC<{
    item: ActionItem | null;
    onClose: () => void;
    onConfirm: (notes?: string) => Promise<void>;
}> = ({ item, onClose, onConfirm }) => {
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!item) return null;

    const handleClose = () => {
        if (isLoading) return;
        setNotes('');
        setError(null);
        setIsSuccess(false);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (item.type === 'quest' && !notes.trim()) {
            setError("Feedback notes are required to reject a quest submission.");
            return;
        }
        setIsLoading(true);
        try {
            await onConfirm(notes);
            setIsSuccess(true);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={!!item} onClose={handleClose} title={isSuccess ? 'Success' : `Reject Submission for ${item.student?.name}`}>
             {isSuccess ? (
                <div className="text-center py-4">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-secondary" />
                    <h3 className="mt-2 text-lg font-medium text-text-primary">Submission Rejected</h3>
                    <p className="mt-2 text-sm text-text-secondary">The student has been notified of the outcome.</p>
                    <Button onClick={handleClose} className="mt-6" variant="secondary">
                        Close
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-text-secondary">
                        {item.type === 'quest'
                            ? "Please provide feedback for the student. This will be visible to them."
                            : "You are about to reject this appeal. This action is final."}
                    </p>
                    {item.type === 'quest' && (
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Constructive feedback (required)..."
                            rows={4}
                            required
                            className="shadow-sm appearance-none border border-border rounded-lg w-full py-2 px-3 bg-white text-text-primary placeholder-text-secondary/70 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                        />
                    )}
                    {error && <p className="text-sm text-danger">{error}</p>}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="neutral" onClick={handleClose} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" variant="danger" disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Confirm Rejection'}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
}


interface QuestApprovalWidgetProps {
    questParticipants: QuestParticipant[];
    quests: Quest[];
    users: User[];
    appeals: Appeal[];
    points: PointLog[];
    onUpdate: () => void;
}

export const QuestApprovalWidget: React.FC<QuestApprovalWidgetProps> = ({ questParticipants, quests, users, appeals, points, onUpdate }) => {
    const { user } = useAuth();
    const { reviewQuestCompletion, reviewAppeal } = useData();
    
    const [activeTab, setActiveTab] = useState<ActionItemType | 'all'>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [confirmingApproval, setConfirmingApproval] = useState<ActionItem | null>(null);
    const [rejectingItem, setRejectingItem] = useState<ActionItem | null>(null);

    const allActionItems = useMemo<ActionItem[]>(() => {
        if (!user) return [];

        const questItems: QuestActionItem[] = questParticipants
            .filter(qp => qp.status === QuestCompletionStatus.SUBMITTED_FOR_REVIEW)
            .map((qp): QuestActionItem | null => {
                const quest = quests.find(q => q.id === qp.questId);
                if (quest && (quest.supervisorId === user.id || user.role === UserRole.ADMIN || user.role === UserRole.SUPER_SECRET_ADMIN)) {
                    return {
                        id: `quest-${qp.questId}-${qp.studentId}`,
                        type: 'quest',
                        submittedAt: new Date(qp.submittedAt!),
                        student: users.find(u => u.id === qp.studentId),
                        data: { ...qp, quest }
                    };
                }
                return null;
            }).filter((item): item is QuestActionItem => !!item);

        let appealItems: AppealActionItem[] = [];
        if (user.role === UserRole.HEAD_OF_CLASS && user.classId) {
             const studentIdsInMyClass = users
                .filter(u => u.role === UserRole.STUDENT && u.classId === user.classId)
                .map(u => u.id);
            
            appealItems = appeals
                .filter(a => a.status === AppealStatus.PENDING && studentIdsInMyClass.includes(a.studentId))
                .map(a => ({
                    id: `appeal-${a.id}`,
                    type: 'appeal',
                    submittedAt: new Date(a.submittedAt),
                    student: users.find(u => u.id === a.studentId),
                    data: { ...a, originalLog: points.find(p => p.id === a.pointLogId) }
                }));
        }

        return [...questItems, ...appealItems].sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

    }, [questParticipants, quests, appeals, points, users, user]);

    const filteredItems = useMemo(() => {
        if (activeTab === 'all') return allActionItems;
        return allActionItems.filter(item => item.type === activeTab);
    }, [activeTab, allActionItems]);

    const handleApproval = (item: ActionItem) => {
        setConfirmingApproval(item);
    };

    const handleConfirmApproval = async () => {
        if (!confirmingApproval) return;

        if (confirmingApproval.type === 'quest') {
            await reviewQuestCompletion(confirmingApproval.data.questId, confirmingApproval.data.studentId, true);
        } else {
            await reviewAppeal(confirmingApproval.data.id, AppealStatus.APPROVED);
        }

        onUpdate();
        setConfirmingApproval(null);
    };

    const handleConfirmRejection = async (rejectionNotes?: string) => {
        if (!rejectingItem) return;

        if (rejectingItem.type === 'quest') {
            await reviewQuestCompletion(rejectingItem.data.questId, rejectingItem.data.studentId, false, rejectionNotes);
        } else {
            await reviewAppeal(rejectingItem.data.id, AppealStatus.REJECTED);
        }
        
        onUpdate();
        // Do not close the modal here; the modal's internal state will handle it.
        // setRejectingItem(null); 
    };

    const renderItem = (item: ActionItem) => {
        const isExpanded = expandedId === item.id;

        const iconMap: Record<ActionItemType, React.ReactNode> = {
            quest: <ClipboardDocumentCheckIcon className="h-5 w-5 text-amber-700" />,
            appeal: <ScaleIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />,
        };

        const title = item.type === 'quest' ? `Quest: ${item.data.quest.title}` : `Appeal: ${item.data.originalLog?.points} pts - ${item.data.originalLog?.category}`;

        return (
             <div key={item.id} className="bg-slate-50/70 border border-border rounded-lg overflow-hidden">
                <div 
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-100/50"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                    <div className="flex items-center space-x-3 overflow-hidden">
                        <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${getAvatarColor(item.student?.name || '?')}`}>
                            {getInitials(item.student?.name || 'Unknown')}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-semibold text-text-primary truncate">{item.student?.name} <span className="font-normal text-xs text-text-secondary">({item.student?.className || 'N/A'})</span></p>
                            <p className="text-xs text-text-secondary truncate" title={title}>{title}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        {iconMap[item.type]}
                        <ChevronDownIcon className={`h-5 w-5 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                </div>
                {isExpanded && (
                    <div className="p-4 border-t border-border bg-white animate-fade-in-up">
                        {item.type === 'quest' ? (
                            <div className='space-y-3'>
                                <div>
                                    <h5 className="font-semibold text-text-primary mb-1">Quest Details</h5>
                                    <p className="text-sm text-text-secondary">{item.data.quest.description}</p>
                                </div>
                                <div className="p-3 bg-slate-100 rounded-lg border border-border">
                                    <h6 className="text-xs font-bold text-text-secondary uppercase mb-2">Rewards for Completion</h6>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-lg text-secondary">+{item.data.quest.points} Points</span>
                                        {item.data.quest.badgeTier && (
                                            <div className="flex items-center gap-1.5 text-sm font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                                <BadgeIconRenderer badge={{tier: item.data.quest.badgeTier, icon: item.data.quest.badgeIcon}} className="h-4 w-4" />
                                                <span>Badge: {item.data.quest.badgeTier}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                 <h5 className="font-semibold text-text-primary text-sm mb-2">Student's Reason:</h5>
                                <p className="text-text-primary my-2 p-3 bg-slate-50 border-l-4 border-slate-300 rounded text-sm">"{item.data.reason}"</p>
                                
                                {item.data.originalLog && (
                                    <>
                                        <h5 className="font-semibold text-text-primary text-sm mt-4 mb-2">Original Log Details:</h5>
                                        <div className="p-3 bg-slate-50 border rounded-md text-sm space-y-1">
                                            <p><strong>Description:</strong> {item.data.originalLog.description}</p>
                                            <p><strong>Points:</strong> <span className="font-bold text-danger">{item.data.originalLog.points}</span></p>
                                            <p><strong>Awarded By:</strong> {users.find(u => u.id === item.data.originalLog?.addedBy)?.name || 'N/A'}</p>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4">
                            <Button size="sm" variant="danger" onClick={() => setRejectingItem(item)}>Reject</Button>
                            <Button size="sm" variant="secondary" onClick={() => handleApproval(item)}>Approve</Button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            <Card title="Action Center" icon={<ScaleIcon className="h-5 w-5" />}>
                <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                        onClick={() => setActiveTab('all')}
                        variant={activeTab === 'all' ? 'primary' : 'neutral'}
                        size="sm"
                    >
                        All ({allActionItems.length})
                    </Button>
                    <Button
                        onClick={() => setActiveTab('quest')}
                        variant={activeTab === 'quest' ? 'primary' : 'neutral'}
                        size="sm"
                    >
                        Quest Reviews ({allActionItems.filter(i => i.type === 'quest').length})
                    </Button>
                    {user?.role === 'head_of_class' && (
                        <Button
                            onClick={() => setActiveTab('appeal')}
                            variant={activeTab === 'appeal' ? 'primary' : 'neutral'}
                            size="sm"
                        >
                            Appeals ({allActionItems.filter(i => i.type === 'appeal').length})
                        </Button>
                    )}
                </div>
                <div className="max-h-[40rem] overflow-y-auto pr-2 space-y-3">
                    {filteredItems.length === 0 ? (
                        <p className="text-center text-text-secondary py-12">Inbox is empty. All caught up!</p>
                    ) : (
                        filteredItems.map(renderItem)
                    )}
                </div>
            </Card>

            <ConfirmationModal
                isOpen={!!confirmingApproval}
                onClose={() => setConfirmingApproval(null)}
                onConfirm={handleConfirmApproval}
                title={`Confirm Approval`}
                message={
                    confirmingApproval?.type === 'quest'
                    ? `Are you sure you want to approve this submission for ${confirmingApproval?.student?.name}? This will grant them the associated points and/or badge.`
                    : `Are you sure you want to approve this appeal for ${confirmingApproval?.student?.name}? This will reverse the original point deduction.`
                }
                confirmText="Confirm Approval"
                confirmVariant="secondary"
            />
            <RejectionModal
                item={rejectingItem}
                onClose={() => setRejectingItem(null)}
                onConfirm={handleConfirmRejection}
            />
        </>
    );
};
