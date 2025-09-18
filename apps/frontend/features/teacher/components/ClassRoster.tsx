
import React, { useMemo, useState } from 'react';
import { User, PointLog, Badge, BadgeTier } from '../../../types';
import { Table } from '../../../components/ui/Table';
import { getAvatarColor, getInitials, getBadgeTextColor } from '../../../utils/helpers';
import { BadgeIconRenderer } from '../../shared/BadgeIconRenderer';
import { Button } from '../../../components/ui/Button';
import { ShieldExclamationIcon } from '../../../assets/icons';
import { QuickViolationLogger } from './QuickViolationLogger';

interface StudentData {
    id: string;
    name: string;
    totalPoints: number;
    badges: Badge[];
    originalStudent: User;
}

const MedalIcons: React.FC<{ badges: Badge[] }> = ({ badges }) => {
    const badgeCountsByTier: Record<BadgeTier, number> = {
        [BadgeTier.GOLD]: 0,
        [BadgeTier.SILVER]: 0,
        [BadgeTier.BRONZE]: 0,
    };
    
    const customIconBadges: Badge[] = [];

    badges.forEach(badge => {
        if (badge.icon) {
            customIconBadges.push(badge);
        } else {
            badgeCountsByTier[badge.tier]++;
        }
    });

    return (
        <div className="flex items-center space-x-3">
            {customIconBadges.map(b => <BadgeIconRenderer key={b.id} badge={b} className={`h-5 w-5 ${getBadgeTextColor(b.tier)}`} />)}
            {Object.entries(badgeCountsByTier).map(([tier, count]) => {
                if(count === 0) return null;
                const badge = { tier: tier as BadgeTier, id: tier, reason:'', awardedOn: new Date(), awardedBy:'' };
                const colorClass = getBadgeTextColor(tier as BadgeTier);
                return (
                    <span key={tier} className={`flex items-center text-xs font-medium ${colorClass}`}>
                        <BadgeIconRenderer badge={badge} className="h-5 w-5 mr-1"/>
                        {count}
                    </span>
                );
            })}
            {badges.length === 0 && <span className="text-xs text-text-secondary">No badges</span>}
        </div>
    );
};

export const ClassRoster: React.FC<{ students: User[], points: PointLog[], onUpdate: () => void }> = ({ students, points, onUpdate }) => {
    const [quickLogStudent, setQuickLogStudent] = useState<User | null>(null);
    
    const rankedStudents: StudentData[] = useMemo(() => {
        const studentData = students.map(student => {
            const studentPoints = points.filter(p => p.studentId === student.id);
            // Calculate total points from actual point logs (no hardcoded base needed)
            const totalPoints = Math.max(0, studentPoints.reduce((acc, p) => acc + p.points, 0));
            const studentBadges = studentPoints.filter(p => p.badge).map(p => p.badge!);
            
            return {
                id: student.id,
                name: student.name,
                totalPoints,
                badges: studentBadges,
                originalStudent: student,
            };
        });
        
        return studentData.sort((a, b) => {
            if (a.totalPoints !== b.totalPoints) {
                return b.totalPoints - a.totalPoints;
            }
            const aGold = a.badges.filter(badge => badge.tier === BadgeTier.GOLD).length;
            const bGold = b.badges.filter(badge => badge.tier === BadgeTier.GOLD).length;
            if (aGold !== bGold) {
                return bGold - aGold;
            }
            const aSilver = a.badges.filter(badge => badge.tier === BadgeTier.SILVER).length;
            const bSilver = b.badges.filter(badge => badge.tier === BadgeTier.SILVER).length;
            if (aSilver !== bSilver) {
                return bSilver - aSilver;
            }
            const aBronze = a.badges.filter(badge => badge.tier === BadgeTier.BRONZE).length;
            const bBronze = b.badges.filter(badge => badge.tier === BadgeTier.BRONZE).length;
            if (aBronze !== bBronze) {
                return bBronze - aBronze;
            }
            const aName = a.name || '';
            const bName = b.name || '';
            return aName.localeCompare(bName);
        });

    }, [students, points]);
    
    const handleCloseModal = () => {
        setQuickLogStudent(null);
        onUpdate();
    }

    if (students.length === 0) {
        return <p className="text-text-secondary text-center py-4">There are no students assigned to your class.</p>;
    }

    return (
        <>
            <div className="max-h-[30rem] overflow-y-auto">
                <Table headers={['Rank', 'Student', 'Total Points', 'Badges', 'Actions']}>
                    {rankedStudents.map((student, index) => (
                        <tr key={student.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-bold text-text-primary text-center w-16">{index + 1}</td>
                            <td className="px-6 py-4">
                                 <div className="flex items-center space-x-3">
                                    <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${getAvatarColor(student.name)}`}>
                                        {getInitials(student.name)}
                                    </div>
                                    <span className="font-medium text-text-primary">{student.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-lg text-primary">{student.totalPoints}</td>
                            <td className="px-6 py-4">
                               <MedalIcons badges={student.badges} />
                            </td>
                            <td className="px-6 py-4">
                                <Button 
                                    size="sm" 
                                    variant="danger-ghost"
                                    onClick={() => setQuickLogStudent(student.originalStudent)}
                                >
                                    <ShieldExclamationIcon className="h-4 w-4 mr-1.5" />
                                    Log Violation
                                </Button>
                            </td>
                        </tr>
                    ))}
                </Table>
            </div>
            <QuickViolationLogger 
                student={quickLogStudent} 
                onClose={handleCloseModal}
            />
        </>
    );
};
