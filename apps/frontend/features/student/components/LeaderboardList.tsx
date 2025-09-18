import React from 'react';
import { User } from '../../../types';
import { getAvatarColor, getInitials } from '../../../utils/helpers';
import { MedalIcon } from '../../../assets/icons';

// Define a more specific type for leaderboard items
interface LeaderboardItem {
    student: User;
    [key: string]: any; // Allow for dynamic value keys like 'points', 'badgeCount', etc.
}

interface LeaderboardListProps {
    data: LeaderboardItem[];
    valueKey: string;
    unit: string;
    currentUser: User;
}

export const LeaderboardList: React.FC<LeaderboardListProps> = ({ data, valueKey, unit, currentUser }) => {
    // Helper function to get full name from user
    const getFullName = (user: User): string => {
        if (!user.firstName && !user.lastName) return 'Unknown User';
        return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    };
    
    // Format display value based on the type
    const formatValue = (value: number, key: string) => {
        if (key === 'totalPoints') {
            return Math.round(value);
        }
        return value;
    };
    
    // Get appropriate color for different metrics
    const getMetricColor = (key: string, isCurrentUser: boolean) => {
        if (isCurrentUser) {
            return 'text-blue-600';
        }
        switch (key) {
            case 'totalPoints':
                return 'text-green-600';
            case 'streak':
                return 'text-orange-600';
            case 'awardPoints':
                return 'text-purple-600';
            case 'badgeCount':
                return 'text-indigo-600';
            default:
                return 'text-accent';
        }
    };
    // Find current user's position in the full leaderboard
    const currentUserIndex = data.findIndex(item => item.student.id === currentUser?.id);
    const currentUserRank = currentUserIndex + 1;
    const currentUserInTop30 = currentUserIndex < 30 && currentUserIndex >= 0;
    const currentUserData = currentUserIndex >= 0 ? data[currentUserIndex] : null;

    const getRankIcon = (rank: number) => {
        if (rank === 1) {
            return <span className="text-yellow-500 text-lg">🥇</span>;
        } else if (rank === 2) {
            return <span className="text-gray-400 text-lg">🥈</span>;
        } else if (rank === 3) {
            return <span className="text-amber-600 text-lg">🥉</span>;
        }
        return null;
    };

    return (
        <div className="space-y-4">
            {/* Current User NOT in Top 30 - Single Performance Box */}
            {!currentUserInTop30 && currentUserData && (
                <div className="mb-6">
                    <div className="text-sm font-medium text-gray-600 mb-3">Your Performance:</div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-xl p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className={`w-10 h-10 aspect-square rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-blue-300 flex-shrink-0 ${getAvatarColor(currentUserData.student.name)}`}>
                                    {getInitials(currentUserData.student.name)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-base font-bold text-blue-800 truncate">{currentUserData.student.name}</div>
                                    <div className="text-xs text-blue-600">Rank #{currentUserRank}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-blue-600">{formatValue(currentUserData[valueKey], valueKey)}</div>
                                <div className="text-xs text-blue-500">{unit}</div>
                                {data.length > 0 && currentUserData[valueKey] < data[0][valueKey] && (
                                    <div className="text-xs text-orange-500 mt-1">
                                        {formatValue(data[0][valueKey] - currentUserData[valueKey], valueKey)} behind #1
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Current User in Top 30 - Single Performance Box */}
            {currentUserInTop30 && currentUserData && (
                <div className="mb-6">
                    <div className="text-sm font-medium text-gray-600 mb-3">Your Performance:</div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 rounded-xl p-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className={`w-10 h-10 aspect-square rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-green-300 flex-shrink-0 ${getAvatarColor(getFullName(currentUserData.student))}`}>
                                    {getInitials(getFullName(currentUserData.student))}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-base font-bold text-green-800 truncate">{getFullName(currentUserData.student)}</div>
                                    <div className="text-xs text-green-600">Rank #{currentUserRank} • TOP {currentUserRank <= 3 ? '3' : currentUserRank <= 10 ? '10' : '30'}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-green-600">{formatValue(currentUserData[valueKey], valueKey)}</div>
                                <div className="text-xs text-green-500">{unit}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Top 30 Leaderboard */}
            <div>
                <div className="text-sm font-medium text-gray-600 mb-2">Top 30 Rankings:</div>
                <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {data.slice(0, 30).map((item, index) => {
                        const isCurrentUser = item.student.id === currentUser?.id;
                        const rank = index + 1;
                        
                        return (
                            <li
                                key={item.student.id}
                                className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                                    isCurrentUser 
                                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-sm' 
                                        : 'bg-slate-50 hover:bg-slate-100 border border-transparent'
                                }`}
                            >
                                <div className="flex items-center min-w-0 flex-1 gap-2">
                                    <span className={`font-bold text-base w-8 flex-shrink-0 text-center ${
                                        isCurrentUser ? 'text-blue-600' : 'text-text-secondary'
                                    }`}>#{rank}</span>
                                    {getRankIcon(rank)}
                                    <div className={`w-8 h-8 aspect-square rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                        isCurrentUser ? `ring-2 ring-blue-300 ${getAvatarColor(getFullName(item.student))}` : getAvatarColor(getFullName(item.student))
                                    }`}>
                                        {getInitials(getFullName(item.student))}
                                    </div>
                                    <span className={`text-sm font-medium min-w-0 flex-1 ${
                                        isCurrentUser ? 'text-blue-800 font-semibold' : 'text-text-primary'
                                    }`}>
                                        <span className="block truncate">{getFullName(item.student)}{isCurrentUser ? ' (You)' : ''}</span>
                                    </span>
                                </div>
                                <div className={`flex items-center font-bold ${
                                    getMetricColor(valueKey, isCurrentUser)
                                }`}>
                                    {formatValue(item[valueKey], valueKey)} <span className={`text-sm font-normal ml-1 ${
                                        isCurrentUser ? 'text-blue-500' : 'text-text-secondary'
                                    }`}>{unit}</span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};
