import { PointLog, PointType, BadgeTier } from '../types';

export interface StudentStats {
  totalPoints: number;
  badgeCount: number;
  streak: number;
  pointsByType: {
    [PointType.REWARD]: number;
    [PointType.VIOLATION]: number;
    [PointType.QUEST]: number;
    [PointType.APPEAL_REVERSAL]: number;
    [PointType.OVERRIDE]: number;
  };
  badgesByTier: {
    [BadgeTier.GOLD]: number;
    [BadgeTier.SILVER]: number;
    [BadgeTier.BRONZE]: number;
  };
  recentActivity: PointLog[];
}

export const calculateStudentStats = (studentId: string, pointLogs: PointLog[]): StudentStats => {
  const studentLogs = pointLogs.filter(log => log.studentId === studentId);
  
  // Calculate total points
  const totalPoints = Math.max(0, studentLogs.reduce((sum, log) => sum + log.points, 0));
  
  // Count badges
  const badgesLogs = studentLogs.filter(log => log.badge);
  const badgeCount = badgesLogs.length;
  
  // Calculate streak (consecutive days with positive activity)
  const streak = calculateStreak(studentLogs);
  
  // Points by type
  const pointsByType = {
    [PointType.REWARD]: studentLogs.filter(log => log.type === PointType.REWARD).reduce((sum, log) => sum + log.points, 0),
    [PointType.VIOLATION]: studentLogs.filter(log => log.type === PointType.VIOLATION).reduce((sum, log) => sum + log.points, 0),
    [PointType.QUEST]: studentLogs.filter(log => log.type === PointType.QUEST).reduce((sum, log) => sum + log.points, 0),
    [PointType.APPEAL_REVERSAL]: studentLogs.filter(log => log.type === PointType.APPEAL_REVERSAL).reduce((sum, log) => sum + log.points, 0),
    [PointType.OVERRIDE]: studentLogs.filter(log => log.type === PointType.OVERRIDE).reduce((sum, log) => sum + log.points, 0),
  };
  
  // Badges by tier
  const badgesByTier = {
    [BadgeTier.GOLD]: badgesLogs.filter(log => log.badge?.tier === BadgeTier.GOLD).length,
    [BadgeTier.SILVER]: badgesLogs.filter(log => log.badge?.tier === BadgeTier.SILVER).length,
    [BadgeTier.BRONZE]: badgesLogs.filter(log => log.badge?.tier === BadgeTier.BRONZE).length,
  };
  
  // Recent activity (last 5 entries)
  const recentActivity = studentLogs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
  
  return {
    totalPoints,
    badgeCount,
    streak,
    pointsByType,
    badgesByTier,
    recentActivity
  };
};

const calculateStreak = (pointLogs: PointLog[]): number => {
  if (pointLogs.length === 0) return 0;
  
  // Sort all logs by date (newest first)
  const sortedLogs = pointLogs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Find the most recent violation (using violation type, not negative points)
  const lastViolation = sortedLogs.find(log => log.type === PointType.VIOLATION);
  
  if (lastViolation) {
    // If there's a violation, calculate days since that violation
    const lastViolationDate = new Date(lastViolation.timestamp);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    lastViolationDate.setHours(0, 0, 0, 0); // Start of violation day
    
    const diffTime = today.getTime() - lastViolationDate.getTime();
    const daysSinceViolation = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, daysSinceViolation);
  } else {
    // No violations ever - calculate days since first positive activity or account creation
    const firstPositiveActivity = sortedLogs
      .filter(log => log.points > 0)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0];
    
    if (firstPositiveActivity) {
      const firstActivityDate = new Date(firstPositiveActivity.timestamp);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      firstActivityDate.setHours(0, 0, 0, 0);
      
      const diffTime = today.getTime() - firstActivityDate.getTime();
      const daysSinceStart = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      return Math.max(0, daysSinceStart);
    }
    
    return 0;
  }
};