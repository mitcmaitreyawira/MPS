
import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Card } from '../../../components/ui/Card';
import { Appeal, AppealStatus, PointLog, ReportStatus, TeacherReport } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { DocumentTextIcon, ScaleIcon } from '../../../assets/icons';
import { ConfirmationModal } from '../../shared/ConfirmationModal';

const StatusBadge: React.FC<{ status: AppealStatus | ReportStatus }> = ({ status }) => {
    const statusStyles: Record<string, string> = {
        [AppealStatus.PENDING]: 'bg-amber-100 text-amber-800',
        [AppealStatus.APPROVED]: 'bg-green-100 text-green-800',
        [AppealStatus.REJECTED]: 'bg-red-100 text-red-800',
        [ReportStatus.NEW]: 'bg-amber-100 text-amber-800',
        [ReportStatus.REVIEWED]: 'bg-green-100 text-green-800',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${statusStyles[status]}`}>
            {status}
        </span>
    );
};

interface SubmissionsTrackerProps {
    appeals: Appeal[];
    teacherReports: TeacherReport[];
    points: PointLog[];
    onUpdate: () => void;
}

export const SubmissionsTracker: React.FC<SubmissionsTrackerProps> = ({ appeals, teacherReports, points, onUpdate }) => {
    const { user } = useAuth();
    const { users, withdrawAppeal } = useData();
    const [activeTab, setActiveTab] = useState<'appeals' | 'reports'>('appeals');
    const [withdrawingAppeal, setWithdrawingAppeal] = useState<string | null>(null);

    const myAppeals = useMemo(() => {
        if (!user) return [];
        return appeals
            .filter(a => a.studentId === user.id)
            .map(a => ({
                ...a,
                pointLog: points.find(p => p.id === a.pointLogId)
            }));
    }, [appeals, user, points]);

    const myReports = useMemo(() => {
        if (!user) return [];
        return teacherReports
            .filter(r => r.submittedByUserId === user.id)
            .map(r => ({
                ...r,
                teacher: users.find(u => u.id === r.targetTeacherId)
            }));
    }, [teacherReports, user, users]);
    
    const handleWithdraw = (appealId: string) => {
        setWithdrawingAppeal(appealId);
    };

    const handleConfirmWithdraw = async () => {
        if (!withdrawingAppeal) return;
        await withdrawAppeal(withdrawingAppeal);
        onUpdate();
        setWithdrawingAppeal(null); // Close modal on success
    };


    return (
        <>
            <Card title="My Submissions" icon={<DocumentTextIcon className="h-5 w-5" />}>
                <div className="flex space-x-1 rounded-lg bg-slate-100 p-1 mb-4">
                    <Button
                        size="md"
                        className="w-full"
                        onClick={() => setActiveTab('appeals')}
                        variant={activeTab === 'appeals' ? 'primary' : 'neutral'}
                    >
                        My Appeals ({myAppeals.length})
                    </Button>
                    <Button
                        size="md"
                        className="w-full"
                        onClick={() => setActiveTab('reports')}
                        variant={activeTab === 'reports' ? 'primary' : 'neutral'}
                    >
                        My Reports ({myReports.length})
                    </Button>
                </div>
                <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
                    {activeTab === 'appeals' && (
                        <>
                            {myAppeals.length === 0 ? (
                                <p className="text-center text-text-secondary py-12">You have not submitted any appeals.</p>
                            ) : (
                                myAppeals.map(appeal => (
                                    <div key={appeal.id} className="p-3 bg-slate-50 border border-border rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-text-primary">
                                                Appeal for: <span className="text-danger">{appeal.pointLog?.points} pts</span> ({appeal.pointLog?.category})
                                            </p>
                                            <p className="text-xs text-text-secondary">Submitted: {new Date(appeal.submittedAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <StatusBadge status={appeal.status} />
                                            {appeal.status === AppealStatus.PENDING && (
                                                <Button size="sm" variant='danger' className="bg-danger/10 text-danger hover:bg-danger/20" onClick={() => handleWithdraw(appeal.id)}>
                                                    Withdraw
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </>
                    )}
                     {activeTab === 'reports' && (
                        <>
                            {myReports.length === 0 ? (
                                <p className="text-center text-text-secondary py-12">You have not submitted any reports.</p>
                            ) : (
                                myReports.map(report => (
                                    <div key={report.id} className="p-3 bg-slate-50 border border-border rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-text-primary">
                                                Report against: {report.teacher?.name || 'Unknown Teacher'}
                                            </p>
                                            <p className="text-xs text-text-secondary">Submitted: {new Date(report.timestamp).toLocaleDateString()} {report.isAnonymous && '(Anonymously)'}</p>
                                        </div>
                                        <StatusBadge status={report.status} />
                                    </div>
                                ))
                            )}
                        </>
                    )}
                </div>
            </Card>
            <ConfirmationModal
                isOpen={!!withdrawingAppeal}
                onClose={() => setWithdrawingAppeal(null)}
                onConfirm={handleConfirmWithdraw}
                title="Confirm Withdrawal"
                message="Are you sure you want to withdraw this appeal? This action cannot be undone."
                confirmText="Confirm Withdraw"
                confirmVariant="danger"
            />
        </>
    );
};
