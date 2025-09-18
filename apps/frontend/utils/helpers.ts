
import { BadgeTier } from "../types";

export const getBadgeColor = (tier: BadgeTier) => {
    switch (tier) {
        case BadgeTier.BRONZE:
            return 'bg-bronze';
        case BadgeTier.SILVER:
            return 'bg-silver';
        case BadgeTier.GOLD:
            return 'bg-gold';
        default:
            return 'bg-gray-500';
    }
};

export const getBadgeTextColor = (tier: BadgeTier) => {
    switch (tier) {
        case BadgeTier.BRONZE:
            return 'text-bronze';
        case BadgeTier.SILVER:
            return 'text-silver';
        case BadgeTier.GOLD:
            return 'text-gold';
        default:
            return 'text-gray-400';
    }
}

export const getInitials = (name: string): string => {
    if (!name) return '??';
    const names = name.split(' ').filter(Boolean);
    if (names.length === 0) return '??';
    const initials = names.map(n => n[0]).join('');
    return initials.length > 2 ? initials.substring(0, 2) : initials;
};

// Simple hashing function to get a color from a string
const nameToHash = (name: string): number => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
};

// Array of Tailwind bg colors for avatars
const avatarColors = [
    'bg-red-200 text-red-800', 'bg-orange-200 text-orange-800', 'bg-amber-200 text-amber-800',
    'bg-yellow-200 text-yellow-800', 'bg-lime-200 text-lime-800', 'bg-green-200 text-green-800',
    'bg-emerald-200 text-emerald-800', 'bg-teal-200 text-teal-800', 'bg-cyan-200 text-cyan-800',
    'bg-sky-200 text-sky-800', 'bg-blue-200 text-blue-800', 'bg-indigo-200 text-indigo-800',
    'bg-violet-200 text-violet-800', 'bg-purple-200 text-purple-800', 'bg-fuchsia-200 text-fuchsia-800',
    'bg-pink-200 text-pink-800', 'bg-rose-200 text-rose-800'
];

export const getAvatarColor = (name: string): string => {
    if (!name) return 'bg-blue-200 text-blue-800';
    const hash = nameToHash(name);
    const index = Math.abs(hash % avatarColors.length);
    return avatarColors[index];
};
