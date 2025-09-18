
import React, { useState, useMemo } from 'react';
import { TeacherReport, ReportStatus, User } from '../../../types';
import { useData } from '../../../context/DataContext';
import { ConfirmationModal } from '../../shared/ConfirmationModal';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { CheckCircleIcon, ChevronDownIcon } from '../../../assets/icons';
import { getAvatarColor, getInitials } from '../../../utils/helpers';

const MiniProfileCard: React.FC<{ user: User | undefined; title: string }> = ({ user, title }) => (
    <div>
        <h4 className="text-xs font-semibold text-text-secondary mb-1">{title}</h4>
        <div className="flex items-center space-x-3 bg-slate-100 p-2 rounded-md">
            <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${user ? getAvatarColor(user.name) : 'bg-gray-200 text-gray-800'}`}>
                {user ? getInitials(user.name) : '?'}
            </div>
            <div>
                <p className="font-medium text-text-primary text-sm">{user ? user.name : 'Unknown User'}</p>
                <p className="text-xs text-text-secondary capitalize">{user ? user.role.replace(/_/g, ' ') : 'N/A'}</p>
            </div>
        </div>
    </div>
);

interface TeacherReportViewerProps {
    reports: TeacherReport[];
    users: User[];
    onUpdate: () => void;
}

export const TeacherReportViewer: React.FC<TeacherReportViewerProps> = ({ reports, users, onUpdate }) => {
    const { reviewTeacherReport, updateTeacherReport } = useData();
    const [filter, setFilter] = useState<ReportStatus | 'all'>(ReportStatus.NEW);
    const [expandedReport, setExpandedReport] = useState<string | null>(null);
    const [confirmReviewId, setConfirmReviewId] = useState<string | null>(null);
    const [responseText, setResponseText] = useState<{ [key: string]: string }>({});

    const handleConfirmReview = async () => {
        if (!confirmReviewId) return;
        await reviewTeacherReport(confirmReviewId);
        onUpdate();
        setConfirmReviewId(null); // Close modal on success
    };

    const handleSendResponse = async (reportId: string) => {
        const response = responseText[reportId];
        if (response && response.trim()) {
            await updateTeacherReport(reportId, { response: response.trim() });
            setResponseText(prev => ({ ...prev, [reportId]: '' }));
            onUpdate();
        }
    };

    const filteredReports = reports.filter(r => filter === 'all' || r.status === filter);

    return (
        <>
            <Card>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-text-primary">Teacher Reports</h3>
                    <div className="flex items-center space-x-2">
                        <Button size="sm" onClick={() => setFilter('all')} variant={filter === 'all' ? 'primary' : 'neutral'}>All ({reports.length})</Button>
                        <Button size="sm" onClick={() => setFilter(ReportStatus.NEW)} variant={filter === ReportStatus.NEW ? 'primary' : 'neutral'}>New ({reports.filter(r => r.status === ReportStatus.NEW).length})</Button>
                        <Button size="sm" onClick={() => setFilter(ReportStatus.REVIEWED)} variant={filter === ReportStatus.REVIEWED ? 'primary' : 'neutral'}>Reviewed ({reports.filter(r => r.status === ReportStatus.REVIEWED).length})</Button>
                    </div>
                </div>

                <div className="max-h-[32rem] overflow-y-auto pr-2 space-y-4">
                    {filteredReports.length > 0 ? filteredReports.map(report => {
                        const reporter = users.find(u => u.id === report.submittedByUserId);
                        const teacher = users.find(u => u.id === report.targetTeacherId);
                        const isExpanded = expandedReport === report.id;

                        return (
                            <div key={report.id} className="p-4 bg-slate-50 border border-border rounded-lg">
                                 <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-text-primary">Report against: <span className="text-danger">{teacher?.name || 'Unknown Teacher'}</span></p>
                                        <p className="text-xs text-text-secondary">
                                            Submitted on {new Date(report.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${report.status === ReportStatus.NEW ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                            {report.status}
                                        </span>
                                        {report.status === ReportStatus.NEW && (
                                            <Button size="sm" onClick={() => setConfirmReviewId(report.id)}>
                                                <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                                                Mark as Reviewed
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                                    <MiniProfileCard user={teacher} title="Reported Teacher" />
                                    <MiniProfileCard user={report.isAnonymous ? undefined : reporter} title={report.isAnonymous ? 'Reporter (Anonymous)' : 'Reporter'} />
                                </div>
                               
                                <div className="mt-2">
                                    <button
                                        onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                                        aria-expanded={isExpanded}
                                        className="w-full text-primary text-sm font-medium flex justify-between items-center group"
                                    >
                                        <span>View Report Details</span>
                                        <ChevronDownIcon className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isExpanded && (
                                        <div className="animate-fade-in-up space-y-4">
                                            <div className="mt-3 pt-3 border-t border-border">
                                                <h4 className="text-sm font-medium text-text-primary mb-2">Report Details:</h4>
                                                <p className="text-sm text-text-primary bg-white p-3 rounded-md shadow-inner border">
                                                    {report.details}
                                                </p>
                                            </div>
                                            
                                            {report.response && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-text-primary mb-2">Admin Response:</h4>
                                                    <p className="text-sm text-text-primary bg-blue-50 p-3 rounded-md border border-blue-200">
                                                        {report.response}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <div>
                                                <h4 className="text-sm font-medium text-text-primary mb-2">Send Response:</h4>
                                                <div className="flex gap-2">
                                                    <textarea
                                                        value={responseText[report.id] || ''}
                                                        onChange={(e) => setResponseText(prev => ({ ...prev, [report.id]: e.target.value }))}
                                                        placeholder="Type your response to this report..."
                                                        className="flex-1 min-h-[80px] px-3 py-2 border border-border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleSendResponse(report.id)}
                                                        disabled={!responseText[report.id]?.trim()}
                                                        className="self-end"
                                                    >
                                                        Send
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }) : (
                        <p className="text-center text-text-secondary py-12">No reports match the current filter.</p>
                    )}
                </div>
            </Card>
            <ConfirmationModal
                isOpen={!!confirmReviewId}
                onClose={() => setConfirmReviewId(null)}
                onConfirm={handleConfirmReview}
                title="Confirm Report Review"
                message="Are you sure you want to mark this report as reviewed? This action is for administrative tracking and cannot be undone."
                confirmText="Mark as Reviewed"
                confirmVariant="secondary"
            />
        </>
    );
};
