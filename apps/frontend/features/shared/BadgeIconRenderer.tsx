
import React from 'react';
import { Badge, BadgeTier } from '../../types';
import { AwardIcon, BronzeMedalIcon, GoldMedalIcon, SilverMedalIcon } from '../../assets/icons';
import { IconRenderer } from '../../assets/icons';

interface BadgeIconRendererProps {
    badge: Pick<Badge, 'tier' | 'icon'>;
    className?: string;
}

export const BadgeIconRenderer: React.FC<BadgeIconRendererProps> = ({ badge, className }) => {
    
    // If a custom icon (like 'star' or 'heart') is specified, render it.
    if (badge.icon) {
        return <IconRenderer iconName={badge.icon} className={className} />;
    }

    // Otherwise, render a tier-specific medal icon by default.
    switch (badge.tier) {
        case BadgeTier.GOLD:
            return <GoldMedalIcon className={className} />;
        case BadgeTier.SILVER:
            return <SilverMedalIcon className={className} />;
        case BadgeTier.BRONZE:
            return <BronzeMedalIcon className={className} />;
        default:
            // Fallback to a generic award icon if tier is unknown.
            return <AwardIcon className={className} />;
    }
};
