import React from 'react';
import { User, UserRole, PointLog, BadgeTier, Award } from '../../../types';
import { calculateStudentStats, StudentStats } from '../../../utils/studentStats';
import { BadgeIconRenderer } from '../../shared/BadgeIconRenderer';
import { MedalIcon, FireIcon, StarIcon, EyeIcon } from '../../../assets/icons';

interface StudentStatsDisplayProps {
  user: User;
  points: PointLog[];
  awards?: Award[];
}

const StudentStatsDisplay: React.FC<StudentStatsDisplayProps> = ({ user, points, awards = [] }) => {
  // Only show stats for students
  if (user.role !== UserRole.STUDENT) {
    return null;
  }

  // Handle case where points might be undefined or null
  const userPointLogs = points || [];
  const stats: StudentStats = calculateStudentStats(user.id, userPointLogs);
  
  // Use actual awards data if provided, otherwise fall back to badge count from point logs
  const actualBadgeCount = awards.length > 0 ? awards.length : stats.badgeCount;
  const actualBadgesByTier = awards.length > 0 ? {
    gold: awards.filter(award => award.tier === BadgeTier.GOLD).length,
    silver: awards.filter(award => award.tier === BadgeTier.SILVER).length,
    bronze: awards.filter(award => award.tier === BadgeTier.BRONZE).length,
  } : stats.badgesByTier;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-blue-200 p-6">
      <div className="flex items-center mb-4">
        <MedalIcon className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-blue-800">Detailed Statistics</h3>
      </div>
      

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Points */}
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">Total Points</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalPoints}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <StarIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-green-500">
            <span className="text-green-600">+{stats.pointsByType.reward}</span> rewards, 
            <span className="text-red-600">{stats.pointsByType.violation}</span> violations
          </div>
        </div>

        {/* Badges */}
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-medium">Total Awards</p>
              <p className="text-2xl font-bold text-purple-600">{actualBadgeCount}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <MedalIcon className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-purple-600 font-medium">
            Get a awards to collect more and show off to your friends #hollyairball
          </div>
        </div>

        {/* Streak */}
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 font-medium">Current Streak</p>
              <p className="text-2xl font-bold text-orange-600">{stats.streak}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <FireIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-2 text-xs text-orange-500">
            This will get reset when u got violation
          </div>
        </div>
      </div>

      {/* Recent Activity Preview */}
      {stats.recentActivity.length > 0 && (
        <div className="mt-4 pt-3 border-t border-blue-200">
          <p className="text-xs font-medium text-blue-600 mb-2">Recent Activity</p>
          <div className="space-y-1">
            {stats.recentActivity.slice(0, 3).map((activity, index) => (
              <div key={activity.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.points > 0 ? 'bg-green-400' : 'bg-red-400'
                  }`} />
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-32">{activity.description}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`font-medium ${
                    activity.points > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {activity.points > 0 ? '+' : ''}{activity.points}
                  </span>
                  {activity.badge && (
                    <BadgeIconRenderer badge={activity.badge} className="h-3 w-3" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      

    </div>
  );
};

export default StudentStatsDisplay;