import React from 'react';

// User types
export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  HEAD_OF_CLASS = 'head_of_class',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name?: string; // Combined first and last name for display
  role: UserRole;
  roles?: string[]; // Array of roles from backend
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  points?: number;
  classId?: string;
  className?: string;
  nisn?: string;
  subject?: string;
  contactNumber?: string;
  childIds?: string[];
}

// Quest types
export enum BadgeTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold'
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  points: number;
  isActive: boolean;
  supervisorId?: string;
  requiredPoints?: number;
  slotsAvailable?: number;
  expiresAt?: Date;
  badgeTier?: BadgeTier;
  badgeReason?: string;
  badgeIcon?: string;
  createdAt: Date;
  createdBy: string;
  academicYear: string;
}

// Quest participation types
export enum QuestParticipantStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface QuestParticipant {
  id: string;
  questId: string;
  userId: string;
  status: QuestParticipantStatus;
  joinedAt: Date;
  completedAt?: Date;
  supervisorNotes?: string;
  studentNotes?: string;
}

// Badge types


// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface LoginForm {
  username: string;
  password: string;
}

export interface QuestForm {
  title: string;
  description: string;
  points: number;
  supervisorId: string;
  requiredPoints?: number;
  slotsAvailable?: number;
  expiresAt?: string;
  badgeTier?: BadgeTier;
  badgeReason?: string;
  badgeIcon?: string;
  isActive: boolean;
}

// UI Component types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Context types
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
  name: string;
  category: string;
  description: string;
  points: number;
  badgeTier?: BadgeTier;
  icon?: string;
  isArchived: boolean;
  createdBy: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  timestamp: Date;
}

export interface DataContextType {
  quests: Quest[];
  questParticipants: QuestParticipant[];
  users: User[];
  classes: Class[];
  actionPresets: ActionPreset[];
  notifications: Notification[];

  loading: boolean;
  error: string | null;
  createQuest: (quest: Omit<Quest, 'id' | 'createdAt' | 'createdBy' | 'academicYear'>) => Promise<Quest>;
  updateQuest: (id: string, updates: Partial<Quest>) => Promise<Quest>;
  deleteQuest: (id: string) => Promise<void>;
  joinQuest: (questId: string) => Promise<QuestParticipant>;
  leaveQuest: (questId: string) => Promise<void>;
  completeQuest: (questId: string, notes?: string) => Promise<void>;
  createClass: (classData: Omit<Class, 'id'>) => Promise<Class>;
  updateClass: (classId: string, updates: Partial<Class>) => Promise<Class>;
  deleteClass: (classId: string) => Promise<void>;
  createActionPreset: (preset: Omit<ActionPreset, 'id' | 'createdBy' | 'isArchived'>) => Promise<ActionPreset>;
  updateActionPreset: (presetId: string, updates: Partial<ActionPreset>) => Promise<ActionPreset>;
  deleteActionPreset: (presetId: string) => Promise<void>;
  markNotificationsAsRead: (ids: string[]) => Promise<void>;
  addBulkAction: (classId: string, action: { type: 'points', points: number, category: string, description: string } | { type: 'badge', presetId: string }) => Promise<void>;
  refreshData: () => Promise<void>;
}

// Component prop types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends ComponentProps {
  type?: string;
  name?: string;
  value?: string | number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  min?: string | number;
  max?: string | number;
}

export interface SelectProps extends ComponentProps {
  name?: string;
  value?: string;
  required?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: SelectOption[];
}

export interface ModalProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface CardProps extends ComponentProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}