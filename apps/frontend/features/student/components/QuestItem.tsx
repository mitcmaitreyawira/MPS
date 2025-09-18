

import React from 'react';
import { Quest, QuestParticipant, QuestCompletionStatus } from '../../../types';
import { DocumentTextIcon, ClockIcon, UserGroupIcon } from '../../../assets/icons';
import { Button } from '../../../components/ui/Button';
import { BadgeIconRenderer } from '../../shared/BadgeIconRenderer';

interface QuestItemProps {
    quest: Quest;
    participantInfo?: QuestParticipant;
    studentTotalPoints?: number;
    allParticipants?: QuestParticipant[];
    onAccept?: (quest: Quest) => void;
    onSubmit?: (questId: string) => void;
    isJoining?: boolean;
}

const QuestItem: React.FC<QuestItemProps> = ({ quest, participantInfo, studentTotalPoints, allParticipants = [], onAccept, onSubmit, isJoining = false }) => {
    
    const isExpired = quest.expiresAt ? new Date(quest.expiresAt) < new Date() : false;
    
    const participantsCount = allParticipants.filter(p => p.questId === quest.id).length;
    const slotsLeft = quest.slotsAvailable ? quest.slotsAvailable - participantsCount : Infinity;
    const areSlotsFull = slotsLeft <= 0;

    const renderAction = () => {
        if (participantInfo) {
            // Ongoing Quests
            switch (participantInfo.status) {
                case QuestCompletionStatus.IN_PROGRESS:
                    return (
                        <Button size="sm" onClick={() => onSubmit?.(quest.id)} className="bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white w-full sm:w-auto">
                            Submit for Review
                        </Button>
                    );
                case QuestCompletionStatus.SUBMITTED_FOR_REVIEW:
                    return (
                        <div className="text-sm font-semibold bg-slate-600 dark:bg-slate-500 text-white px-3 py-1.5 rounded-full text-center">
                            Pending Approval
                        </div>
                    );
                case QuestCompletionStatus.COMPLETED:
                    return (
                        <div className="text-sm font-semibold bg-secondary/80 text-white px-3 py-1.5 rounded-full text-center">
                            Completed!
                        </div>
                    );
                default:
                    return null;
            }
        } else {
            // Available Quests
            const canJoinByPoints = studentTotalPoints !== undefined && studentTotalPoints <= quest.requiredPoints;
            const canJoin = canJoinByPoints && !isExpired && !areSlotsFull;
            
            let buttonText = 'Accept Quest';
            if (isJoining) {
                buttonText = 'Joining...';
            } else if (isExpired) {
                buttonText = 'Expired';
            } else if (areSlotsFull) {
                buttonText = 'Full';
            } else if (!canJoinByPoints) {
                buttonText = 'Points Required';
            }
            
            return (
                <Button 
                    size="sm" 
                    onClick={() => onAccept?.(quest)}
                    disabled={!canJoin || isJoining}
                    className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white disabled:bg-slate-400 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                    {buttonText}
                </Button>
            );
        }
    };

    const renderRequirement = () => {
        if (participantInfo) return null; // No requirement text for ongoing quests
        
        const canJoinByPoints = studentTotalPoints !== undefined && studentTotalPoints <= quest.requiredPoints;
        const hasEligibilityIssues = isExpired || areSlotsFull || !canJoinByPoints;
        
        if (!hasEligibilityIssues) {
            return (
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-xs text-green-600 font-medium">Eligible to join!</p>
                </div>
            );
        }
        
        const issues = [];
        if (isExpired) issues.push('Quest has expired');
        if (areSlotsFull) issues.push('No slots available');
        if (!canJoinByPoints) issues.push(`Requires max. ${quest.requiredPoints} pts (You have ${studentTotalPoints})`);
        
        return (
            <div className="space-y-1">
                {issues.map((issue, index) => (
                    <div key={index} className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <p className="text-xs text-red-600">{issue}</p>
                    </div>
                ))}
            </div>
        );
    };
    
    const questBadge = quest.badgeTier ? { tier: quest.badgeTier, icon: quest.badgeIcon } : null;

    return (
        <div className="bg-amber-50/50 border-2 border-dashed border-amber-300 rounded-lg p-3 sm:p-5 flex flex-col h-full relative overflow-hidden transition-all duration-300 ease-out hover:scale-110 hover:border-solid hover:shadow-2xl hover:-translate-y-1 hover:border-amber-400">
            <div className="flex items-start space-x-3 sm:space-x-4 mb-3">
                <div className="bg-amber-200 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                    <DocumentTextIcon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-700" />
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-amber-900 text-base sm:text-lg">{quest.title}</h4>
                    <p className="text-xs sm:text-sm text-amber-800/80 mt-1">{quest.description}</p>
                </div>
            </div>
            
             <div className="text-xs text-amber-800/90 space-y-1 my-2">
                {quest.expiresAt && (
                    <div className={`flex items-center gap-1.5 ${isExpired ? 'text-danger' : ''}`}>
                        <ClockIcon className="h-4 w-4"/>
                        <span>Expires {new Date(quest.expiresAt).toLocaleDateString()}</span>
                    </div>
                )}
                {quest.slotsAvailable && (
                     <div className={`flex items-center gap-1.5 ${areSlotsFull ? 'text-danger' : ''}`}>
                        <UserGroupIcon className="h-4 w-4"/>
                        <span>{isFinite(slotsLeft) ? `${slotsLeft} slots left` : 'Unlimited slots'}</span>
                    </div>
                )}
            </div>

            {participantInfo?.reviewNotes && (
                <div className="my-2 p-2 bg-red-100 border-l-4 border-danger rounded-r-md">
                    <p className="text-sm font-semibold text-red-800">Feedback from your teacher:</p>
                    <p className="text-xs text-red-700 italic">"{participantInfo.reviewNotes}"</p>
                </div>
            )}
            
            <div className="mt-auto pt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className='flex flex-col'>
                     <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-accent">+{quest.points} Points</span>
                        {questBadge && (
                            <div className="flex items-center gap-1 text-xs font-semibold bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                                <BadgeIconRenderer badge={questBadge} className="h-4 w-4" />
                                <span>+Badge</span>
                            </div>
                        )}
                    </div>
                    {renderRequirement()}
                </div>
                {renderAction()}
            </div>
        </div>
    );
};

export default QuestItem;