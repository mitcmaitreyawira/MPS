import React, { useState } from 'react';
import { PointLog, PointType, User, UserRole, BadgeTier, AppealStatus, Appeal } from '../types';
import { ArrowUpCircleIcon, ArrowDownCircleIcon, CheckCircleIcon, ScaleIcon, PencilIcon } from '../assets/icons';
import TeacherProfilePopover from '../features/shared/TeacherProfilePopover';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { useAuth } from '../context/AuthContext';
import { BadgeIconRenderer } from '../features/shared/BadgeIconRenderer';
import BadgeManagement from './BadgeManagement';

const INITIAL_VISIBLE_COUNT = 10;

interface ActivityLogWithBadgeManagementProps {
    points: PointLog[];
    users: User[];
    appeals?: Appeal[];
    onAppealRequest?: (pointLogId: string) => void;
    onPointLogUpdate?: (updatedPointLog: PointLog) => void;
    onPointLogDelete?: (pointLogId: string) => void;
}

const AppealStatusBadge: React.FC<{ status: AppealStatus }> = ({ status }) => {
    const statusStyles = {
        [AppealStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
        [AppealStatus.APPROVED]: 'bg-green-100 text-green-800',
        [AppealStatus.REJECTED]: 'bg-red-100 text-red-800',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const ActivityLogWithBadgeManagement: React.FC<ActivityLogWithBadgeManagementProps> = ({ 
    points, 
    users, 
    onAppealRequest, 
    appeals = [],
    onPointLogUpdate,
    onPointLogDelete
}) => {
    const { user } = useAuth();
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
    const [selectedPointLog, setSelectedPointLog] = useState<PointLog | null>(null);
    const [showBadgeManagement, setShowBadgeManagement] = useState(false);

    const handleShowMore = () => setVisibleCount(points.length);
    const handleShowLess = () => setVisibleCount(INITIAL_VISIBLE_COUNT);

    const canManageBadges = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_SECRET_ADMIN || user?.role === UserRole.TEACHER || user?.role === UserRole.HEAD_OF_CLASS;

    const handleBadgeManagement = (pointLog: PointLog) => {
        setSelectedPointLog(pointLog);
        setShowBadgeManagement(true);
    };

    const handleBadgeUpdate = (updatedPointLog: PointLog) => {
        onPointLogUpdate?.(updatedPointLog);
        setShowBadgeManagement(false);
        setSelectedPointLog(null);
    };

    const handleBadgeDelete = (pointLogId: string) => {
        onPointLogDelete?.(pointLogId);
        setShowBadgeManagement(false);
        setSelectedPointLog(null);
    };

    const getIcon = (type: PointType) => {
        const iconWrapperClass = "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0";
        switch (type) {
            case PointType.REWARD:
                return <div className={`${iconWrapperClass} bg-secondary/10 text-secondary`}><ArrowUpCircleIcon className="h-6 w-6" /></div>;
            case PointType.VIOLATION:
                return <div className={`${iconWrapperClass} bg-danger/10 text-danger`}><ArrowDownCircleIcon className="h-6 w-6" /></div>;
            case PointType.QUEST:
                return <div className={`${iconWrapperClass} bg-accent/10 text-accent`}><BadgeIconRenderer badge={{tier:BadgeTier.GOLD, icon:'star'}} className="h-6 w-6" /></div>;
            case PointType.APPEAL_REVERSAL:
                 return <div className={`${iconWrapperClass} bg-blue-100 text-blue-600`}><ScaleIcon className="h-6 w-6" /></div>;
            case PointType.OVERRIDE:
                return <div className={`${iconWrapperClass} bg-green-200 text-green-600`}><CheckCircleIcon className="h-6 w-6" /></div>;
            default:
                return <div className={`${iconWrapperClass} bg-green-200 text-green-600`}><CheckCircleIcon className="h-6 w-6" /></div>;
        }
    };
    
    if (points.length === 0) {
        return <p className="text-text-secondary text-center py-8">No activity yet.</p>;
    }

    const sortedPoints = [...points].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <>
            <div className="space-y-4">
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {sortedPoints.slice(0, visibleCount).map((log) => {
                        const awardedBy = users.find(u => u.id === log.addedBy);
                        const associatedAppeal = appeals.find(a => a.pointLogId === log.id);
                        const canAppeal = onAppealRequest && log.type === PointType.VIOLATION && user?.role === UserRole.STUDENT && !associatedAppeal;
                        const isOverturned = associatedAppeal?.status === AppealStatus.APPROVED;

                        return (
                            <div key={log.id} className="flex items-start space-x-4 group">
                                {log.badge ? <div className="w-10 h-10 flex items-center justify-center"><BadgeIconRenderer badge={log.badge} className="h-8 w-8"/></div> : getIcon(log.type)}
                                <div className="flex-grow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-grow">
                                            <p className={`text-sm text-text-primary font-medium ${isOverturned ? 'line-through text-blue-400' : ''}`}>{log.description}</p>
                                            <div className="text-xs text-text-secondary flex items-center gap-2 flex-wrap">
                                                <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                                                {log.addedBy && <span>{'by'}</span>}
                                                {awardedBy ? (
                                                    <TeacherProfilePopover teacher={awardedBy}>
                                                        <span className="text-primary font-medium cursor-pointer hover:underline">{awardedBy.name}</span>
                                                    </TeacherProfilePopover>
                                                ) : log.addedBy ? (
                                                    <span className="text-text-secondary italic">[Deleted User]</span>
                                                ) : null}
                                                {canAppeal && (
                                                    <Button size="sm" className="px-1.5 py-0.5 !text-xs bg-blue-200 text-blue-700 hover:bg-blue-300" onClick={() => onAppealRequest(log.id)}>
                                                        Appeal
                                                    </Button>
                                                )}
                                                {associatedAppeal && <AppealStatusBadge status={associatedAppeal.status} />}
                                            </div>
                                            {log.badge && (
                                                <div className="mt-1 text-xs text-text-secondary">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                                        {log.badge.tier.charAt(0).toUpperCase() + log.badge.tier.slice(1)} Badge: {log.badge.reason}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className={`text-lg font-bold flex-shrink-0 ${log.points > 0 ? 'text-secondary' : 'text-danger'} ${isOverturned ? 'line-through text-blue-400' : ''}`}>
                                                {log.points > 0 ? `+${log.points}` : log.points}
                                            </div>
                                            {canManageBadges && log.badge && (
                                                <button
                                                    onClick={() => handleBadgeManagement(log)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600 rounded"
                                                    title="Manage Badge"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {points.length > INITIAL_VISIBLE_COUNT && (
                    <div className="text-center pt-4 border-t border-border">
                        {visibleCount < points.length ? (
                            <Button variant="neutral" onClick={handleShowMore}>
                                Show All ({points.length}) Activities
                            </Button>
                        ) : (
                             <Button variant="neutral" onClick={handleShowLess}>
                                Show Less
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Badge Management Modal */}
            <Modal 
                isOpen={showBadgeManagement} 
                onClose={() => {
                    setShowBadgeManagement(false);
                    setSelectedPointLog(null);
                }}
                title="Manage Badge"
                size="lg"
            >
                {selectedPointLog && (
                    <BadgeManagement
                        pointLog={selectedPointLog}
                        onUpdate={handleBadgeUpdate}
                        onDelete={handleBadgeDelete}
                        showActions={true}
                    />
                )}
            </Modal>
        </>
    );
};

export default ActivityLogWithBadgeManagement;