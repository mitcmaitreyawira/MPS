
import React, { useState, useMemo } from 'react';
import { useData } from '../../../context/DataContext';
import { Card } from '../../../components/ui/Card';
import { ScaleIcon, ChevronDownIcon, CheckCircleIcon, XCircleIcon } from '../../../assets/icons';
import { AppealStatus, PointLog, User, Appeal } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { getAvatarColor, getInitials } from '../../../utils/helpers';
import { ConfirmationModal } from '../../shared/ConfirmationModal';

interface ProcessedAppeal extends Appeal {
    student: User;
    originalLog: PointLog;
    reviewer: User | undefined;
}

const AppealStatusBadge: React.FC<{ status: AppealStatus }> = ({ status }) => {
    const styles: Record<AppealStatus, string> = {
        [AppealStatus.PENDING]: 'bg-amber-100 text-amber-800',
        [AppealStatus.APPROVED]: 'bg-green-100 text-green-800',
        [AppealStatus.REJECTED]: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${styles[status]}`}>
            {status}
        </span>
    );
};

const AppealItem: React.FC<{ appeal: ProcessedAppeal; onReview: (appeal: ProcessedAppeal, status: AppealStatus.APPROVED | AppealStatus.REJECTED) => void; }> = ({ appeal, onReview }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-slate-50 border border-border rounded-lg">
            <div className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex items-center space-x-3 flex-grow">
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${getAvatarColor(appeal.student.name)}`}>
                        {getInitials(appeal.student.name)}
                    </div>
                    <div>
                        <p className="font-semibold text-text-primary">{appeal.student.name}</p>
                        <p className="text-xs text-text-secondary">Submitted: {new Date(appeal.submittedAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <AppealStatusBadge status={appeal.status} />
                     <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="p-1 rounded-full text-text-secondary hover:bg-slate-200">
                        <ChevronDownIcon className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 border-t border-border space-y-4 animate-fade-in-up">
                    <div>
                        <h5 className="font-semibold text-text-primary text-xs mb-1">Student's Reason:</h5>
                        <p className="text-text-primary my-1 p-3 bg-white border-l-4 border-slate-300 rounded text-sm">"{appeal.reason}"</p>
                    </div>
                    <div>
                        <h5 className="font-semibold text-text-primary text-xs mb-1">Original Log Details:</h5>
                        <div className="p-3 bg-white border rounded-md text-sm space-y-1">
                            <p><strong>Description:</strong> {appeal.originalLog.description}</p>
                            <p><strong>Points:</strong> <span className="font-bold text-danger">{appeal.originalLog.points}</span></p>
                        </div>
                    </div>

                    {appeal.status === AppealStatus.PENDING ? (
                         <div className="flex justify-end space-x-2 pt-2">
                            <Button size="sm" variant="danger" onClick={() => onReview(appeal, AppealStatus.REJECTED)}><XCircleIcon className="h-4 w-4 mr-1.5" />Reject</Button>
                            <Button size="sm" variant="secondary" onClick={() => onReview(appeal, AppealStatus.APPROVED)}><CheckCircleIcon className="h-4 w-4 mr-1.5" />Approve</Button>
                        </div>
                    ) : (
                         <div className="pt-3 border-t border-dashed">
                             <p className="text-xs text-text-secondary">
                                Reviewed by <span className="font-medium text-text-primary">{appeal.reviewer?.name || 'N/A'}</span> on {appeal.reviewedAt ? new Date(appeal.reviewedAt).toLocaleDateString() : 'N/A'}.
                             </p>
                         </div>
                    )}
                </div>
            )}
        </div>
    );
};

interface AppealManagerWidgetProps {
    appeals: Appeal[];
    users: User[];
    points: PointLog[];
    onUpdate: () => void;
}

export const AppealManagerWidget: React.FC<AppealManagerWidgetProps> = ({ appeals, users, points, onUpdate }) => {
    const { reviewAppeal } = useData();
    const [filter, setFilter] = useState<AppealStatus | 'all'>(AppealStatus.PENDING);
    const [confirmingReview, setConfirmingReview] = useState<{ appeal: ProcessedAppeal, status: AppealStatus.APPROVED | AppealStatus.REJECTED } | null>(null);

    const processedAppeals = useMemo(() => {
        return appeals
            .map(a => ({
                ...a,
                student: users.find(u => u.id === a.studentId),
                originalLog: points.find(p => p.id === a.pointLogId),
                reviewer: a.reviewedBy ? users.find(u => u.id === a.reviewedBy) : undefined,
            }))
            .filter((a): a is ProcessedAppeal => !!(a.student && a.originalLog))
            .sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    }, [appeals, users, points]);
    
    const filteredAppeals = useMemo(() => {
        if (filter === 'all') return processedAppeals;
        return processedAppeals.filter(a => a.status === filter);
    }, [filter, processedAppeals]);

    const handleTriggerReview = (appeal: ProcessedAppeal, status: AppealStatus.APPROVED | AppealStatus.REJECTED) => {
        setConfirmingReview({ appeal, status });
    };

    const handleConfirmReview = async () => {
        if (!confirmingReview) return;
        const { appeal, status } = confirmingReview;
        await reviewAppeal(appeal.id, status);
        onUpdate();
        setConfirmingReview(null); // Close modal on success
    };
    
    const FilterButton: React.FC<{
        status: AppealStatus | 'all';
        label: string;
        count: number;
    }> = ({ status, label, count }) => {
        const isActive = filter === status;
        return (
            <Button
                size="sm"
                onClick={() => setFilter(status)}
                variant={isActive ? 'primary' : 'neutral'}
            >
                {label} ({count})
            </Button>
        );
    };

    return (
        <>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                    <h3 className="text-xl font-semibold text-text-primary flex items-center gap-3">
                        <ScaleIcon className="h-6 w-6" />
                        Student Appeal Manager
                    </h3>
                    <div className="flex items-center space-x-2">
                        <FilterButton status={AppealStatus.PENDING} label="Pending" count={processedAppeals.filter(a => a.status === 'pending').length} />
                        <FilterButton status={AppealStatus.APPROVED} label="Approved" count={processedAppeals.filter(a => a.status === 'approved').length} />
                        <FilterButton status={AppealStatus.REJECTED} label="Rejected" count={processedAppeals.filter(a => a.status === 'rejected').length} />
                        <FilterButton status={'all'} label="All" count={processedAppeals.length} />
                    </div>
                </div>
                <div className="max-h-[32rem] overflow-y-auto pr-2 space-y-3">
                    {filteredAppeals.length > 0 ? (
                        filteredAppeals.map(appeal => (
                            <AppealItem key={appeal.id} appeal={appeal} onReview={handleTriggerReview} />
                        ))
                    ) : (
                         <p className="text-text-secondary text-center py-12">No appeals match the current filter.</p>
                    )}
                </div>
            </Card>
            <ConfirmationModal
                isOpen={!!confirmingReview}
                onClose={() => setConfirmingReview(null)}
                onConfirm={handleConfirmReview}
                title={`Confirm Appeal ${confirmingReview?.status === 'approved' ? 'Approval' : 'Rejection'}`}
                message={
                    <p>
                        Are you sure you want to <strong>{confirmingReview?.status}</strong> this appeal from <strong>{confirmingReview?.appeal.student.name}</strong>?
                    </p>
                }
                confirmText={`Yes, ${confirmingReview?.status === 'approved' ? 'Approve' : 'Reject'}`}
                confirmVariant={confirmingReview?.status === 'approved' ? 'secondary' : 'danger'}
            />
        </>
    );
};
