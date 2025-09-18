
import React, { useState } from 'react';
import { PointLog, PointType, User, UserRole, BadgeTier, AppealStatus, Appeal } from '../../types';
import { ArrowUpCircleIcon, ArrowDownCircleIcon, CheckCircleIcon, ScaleIcon } from '../../assets/icons';
import TeacherProfilePopover from './TeacherProfilePopover';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { BadgeIconRenderer } from './BadgeIconRenderer';

const INITIAL_VISIBLE_COUNT = 10;

interface ActivityLogProps {
    points: PointLog[];
    users: User[];
    appeals?: Appeal[];
    onAppealRequest?: (pointLogId: string) => void;
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


const ActivityLog: React.FC<ActivityLogProps> = ({ points, users, onAppealRequest, appeals = [] }) => {
    const { user } = useAuth();
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
    
    const handleShowMore = () => {
        setVisibleCount(points.length);
    };

    const handleShowLess = () => {
        setVisibleCount(INITIAL_VISIBLE_COUNT);
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
                 return <div className={`${iconWrapperClass} bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400`}><ScaleIcon className="h-6 w-6" /></div>;
            case PointType.OVERRIDE:
                return <div className={`${iconWrapperClass} bg-slate-200 text-slate-600`}><CheckCircleIcon className="h-6 w-6" /></div>;
            default:
                return <div className={`${iconWrapperClass} bg-slate-200 text-slate-600`}><CheckCircleIcon className="h-6 w-6" /></div>;
        }
    };
    
    if (points.length === 0) {
        return <p className="text-text-secondary text-center py-8">No activity yet.</p>;
    }

    const sortedPoints = [...points].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="space-y-4">
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {sortedPoints.slice(0, visibleCount).map((log) => {
                    const awardedBy = users.find(u => u.id === log.addedBy);
                    const associatedAppeal = appeals.find(a => a.pointLogId === log.id);
                    const canAppeal = onAppealRequest && log.type === PointType.VIOLATION && user?.role === UserRole.STUDENT && !associatedAppeal;
                    const isOverturned = associatedAppeal?.status === AppealStatus.APPROVED;

                    return (
                        <div key={log.id} className="flex items-start space-x-4">
                            {log.badge ? <div className="w-10 h-10 flex items-center justify-center"><BadgeIconRenderer badge={log.badge} className="h-8 w-8"/></div> : getIcon(log.type)}
                            <div className="flex-grow">
                                <p className={`text-sm text-text-primary font-medium ${isOverturned ? 'line-through text-slate-400' : ''}`}>{log.description}</p>
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
                                        <Button size="sm" className="px-1.5 py-0.5 !text-xs bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => onAppealRequest(log.id)}>
                                            Appeal
                                        </Button>
                                    )}
                                    {associatedAppeal && <AppealStatusBadge status={associatedAppeal.status} />}
                                </div>
                            </div>
                            <div className={`text-lg font-bold flex-shrink-0 ${log.points > 0 ? 'text-secondary' : 'text-danger'} ${isOverturned ? 'line-through text-slate-400' : ''}`}>
                                {log.points > 0 ? `+${log.points}` : log.points}
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
    );
};

export default ActivityLog;