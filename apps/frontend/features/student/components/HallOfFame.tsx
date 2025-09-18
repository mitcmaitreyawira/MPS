
import React, { useState } from 'react';
import { Award, AwardTier } from '../../../types';
import { StarIcon, AwardIcon, MedalIcon } from '../../../assets/icons';

export const HallOfFame: React.FC<{ awards: Award[] }> = ({ awards }) => {
    const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

    const tierStyles: Record<AwardTier, { bg: string; iconColor: string; hover: string }> = {
        [AwardTier.BRONZE]: {
            bg: 'bg-gradient-to-br from-amber-600 to-amber-800',
            iconColor: 'text-white/90',
            hover: 'hover:brightness-110'
        },
        [AwardTier.SILVER]: {
            bg: 'bg-gradient-to-br from-slate-400 to-slate-600',
            iconColor: 'text-white/90',
            hover: 'hover:brightness-110'
        },
        [AwardTier.GOLD]: {
            bg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
            iconColor: 'text-white/90',
            hover: 'hover:brightness-110'
        },
        [AwardTier.PLATINUM]: {
            bg: 'bg-gradient-to-br from-purple-500 to-purple-700',
            iconColor: 'text-white/90',
            hover: 'hover:brightness-110'
        },
    };

    const handleAwardHover = (awardId: string) => {
        setActiveTooltipId(awardId);
    };

    const handleAwardLeave = () => {
        setActiveTooltipId(null);
    };

    const handleAwardClick = (awardId: string) => {
        setActiveTooltipId(activeTooltipId === awardId ? null : awardId);
    };

    const getAwardIcon = (award: Award) => {
        // If custom icon is specified, render it as text/emoji
        if (award.icon && award.icon.trim() !== '') {
            return (
                <span className="text-2xl" style={{ fontSize: '2.25rem', lineHeight: '1' }}>
                    {award.icon}
                </span>
            );
        }
        
        // Fall back to default icons based on tier
        switch (award.tier) {
            case AwardTier.GOLD:
                return <AwardIcon className="h-9 w-9" />;
            case AwardTier.SILVER:
                return <MedalIcon className="h-9 w-9" />;
            case AwardTier.BRONZE:
                return <MedalIcon className="h-9 w-9" />;
            case AwardTier.PLATINUM:
                return <StarIcon className="h-9 w-9" />;
            default:
                return <MedalIcon className="h-9 w-9" />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-pink-800 flex items-center gap-2">
                    <AwardIcon className="h-5 w-5" />
                    Hall of Fame
                </h3>
                <span className="text-sm text-pink-600">{awards.length} Total Awards</span>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 auto-rows-max">
                {awards.map((award) => {
                    const styles = tierStyles[award.tier];
                    const isTooltipVisible = activeTooltipId === award.id;

                    return (
                        <div key={award.id} className="relative flex flex-col items-center">
                            <div className="relative">
                                <div
                                    onMouseEnter={() => handleAwardHover(award.id)}
                                    onMouseLeave={handleAwardLeave}
                                    onClick={() => handleAwardClick(award.id)}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ease-out hover:scale-125 hover:shadow-2xl hover:-translate-y-2 hover:rotate-3 ${styles.bg} ${styles.iconColor} ${styles.hover}`}
                                >
                                    {getAwardIcon(award)}
                                </div>
                                
                                {isTooltipVisible && (
                                    <div className="absolute top-0 mt-2 left-1/2 -translate-x-1/2 w-max max-w-xs px-4 py-3 bg-white border border-gray-200 shadow-lg rounded-lg z-10 animate-fade-in-up">
                                        <p className="font-bold text-gray-900">{award.name}</p>
                                        <p className="text-gray-600 mt-1 text-sm">{award.description}</p>
                                        <p className="text-gray-500 text-xs mt-2">
                                            {award.tier.charAt(0).toUpperCase() + award.tier.slice(1)} • {new Date(award.awardedOn).toLocaleDateString()}
                                        </p>
                                        {award.awardedByName && (
                                            <p className="text-gray-500 text-xs">
                                                Awarded by {award.awardedByName}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-2 text-center">
                                <p className="text-xs font-medium text-pink-700 truncate max-w-[80px]" title={award.name}>
                                    {award.name}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
