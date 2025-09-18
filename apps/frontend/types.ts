

export enum UserRole {
    STUDENT = 'student',
    TEACHER = 'teacher',
    HEAD_OF_CLASS = 'head_of_class',
    ADMIN = 'admin',
    SUPER_SECRET_ADMIN = 'supersecretadmin',
    PARENT = 'parent',
}

export interface User {
    id: string;
    nisn: string;
    name: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    roles: string[]; // Changed from single role to roles array
    role?: UserRole; // Keep for backward compatibility
    classId?: string;
    className?: string;
    subject?: string; // e.g., "Math, Science"
    contactNumber?: string; // e.g., "555-123-4567"
    childIds?: string[]; // For parents
    isArchived?: boolean;
    points?: number; // User points for filtering and sorting
    streak?: number; // Days without violations (calculated field)
}

export enum PointType {
    REWARD = 'reward',
    VIOLATION = 'violation',
    QUEST = 'quest',
    APPEAL_REVERSAL = 'appeal_reversal',
    OVERRIDE = 'override',
}

export enum BadgeTier {
    BRONZE = 'bronze',
    SILVER = 'silver',
    GOLD = 'gold',
}

export interface Badge {
    id: string;
    tier: BadgeTier;
    reason: string;
    awardedBy: string; // User ID of teacher/admin
    awardedOn: Date;
    icon?: string; // e.g. 'star', 'heart'
}

export interface PointLog {
    id:string;
    studentId: string;
    points: number;
    type: PointType;
    category: string;
    description: string;
    timestamp: Date;
    addedBy: string; // User ID
    badge?: Badge;
    academicYear?: string;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    points: number;
    createdBy: string; // Admin ID
    createdAt: Date;
    isActive: boolean;
    supervisorId: string; // Teacher ID
    requiredPoints: number; // Maximum points to join
    badgeTier?: BadgeTier;
    badgeReason?: string;
    badgeIcon?: string;
    slotsAvailable?: number;
    expiresAt?: Date;
    academicYear?: string;
}

export enum QuestCompletionStatus {
    IN_PROGRESS = 'in_progress',
    SUBMITTED_FOR_REVIEW = 'submitted_for_review',
    COMPLETED = 'completed',
}

export interface QuestParticipant {
    questId: string;
    studentId: string;
    joinedAt: Date;
    status: QuestCompletionStatus;
    submittedAt?: Date;
    completedAt?: Date;
    reviewNotes?: string;
    academicYear?: string;
}

export enum AppealStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export interface Appeal {
    id: string;
    pointLogId: string;
    studentId: string;
    reason: string;
    status: AppealStatus;
    submittedAt: Date;
    reviewedBy?: string; // Admin/Teacher ID
    reviewedAt?: Date;
    academicYear?: string;
}

export interface AuditLog {
    id: string;
    timestamp: Date;
    adminId: string;
    action: string;
    details: Record<string, any>;
    academicYear?: string;
}

export interface Class {
    id: string;
    name: string;
    headTeacherId?: string;
}

export enum ActionType {
    REWARD = 'reward',
    VIOLATION = 'violation',
    MEDAL = 'medal',
}

export interface ActionPreset {
    id: string;
    type: ActionType;
    name: string; // e.g., "Excellent Participation"
    category: string;
    description: string;
    points: number;
    badgeTier?: BadgeTier; // Only for MEDAL type
    icon?: string; // Only for MEDAL type
    isArchived: boolean;
    createdBy: string; // Admin ID
}

export enum ReportStatus {
    NEW = 'new',
    REVIEWED = 'reviewed',
}

export interface TeacherReport {
    id: string;
    submittedByUserId: string;
    isAnonymous: boolean;
    targetTeacherId: string;
    details: string;
    timestamp: Date;
    status: ReportStatus;
    response?: string;
    reviewedByUserId?: string;
    reviewedAt?: Date;
    academicYear?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  timestamp: Date;
}

export enum AwardType {
  ACADEMIC = 'academic',
  BEHAVIOR = 'behavior',
  PARTICIPATION = 'participation',
  LEADERSHIP = 'leadership',
  COMMUNITY_SERVICE = 'community_service',
  SPECIAL_ACHIEVEMENT = 'special_achievement',
  CUSTOM = 'custom',
}

export enum AwardStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
  PENDING = 'pending',
}

export enum AwardTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

export interface Award {
  id: string;
  name: string;
  description: string;
  type: AwardType;
  tier: AwardTier;
  icon: string;
  status: AwardStatus;
  recipientId?: string;
  recipientName?: string;
  awardedBy: string;
  awardedByName?: string;
  awardedOn: Date;
  reason?: string;
  academicYear?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AwardStats {
  total: number;
  byType: Array<{ type: AwardType; count: number }>;
  byTier: Array<{ tier: AwardTier; count: number }>;
  byStatus: Array<{ status: AwardStatus; count: number }>;
  topRecipients: Array<{
    _id: string;
    count: number;
    recipient?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      avatar?: string;
    };
  }>;
  recentAwards: Award[];
}