// This file acts as the network layer of the real application.
// It makes fetch requests to the backend server.

import { User, PointLog, Quest, QuestParticipant, Appeal, AppealStatus, AuditLog, Class, Badge, ActionPreset, TeacherReport, Notification, Award, AwardStats, AwardType, AwardTier, AwardStatus } from '../types';
import * as PasswordAPI from './password-management.api';
import { ErrorHandler, ErrorClassifier, NetworkErrorHandler, ErrorType, ErrorSeverity } from '../utils/errorHandling';

// Base URL for backend API.  It can be overridden in your `.env` file via
// VITE_API_URL to point to a different host or API prefix.  If not set,
// defaults to '/api'.
// See `.env.example` for guidance on configuring this value.
const API_URL: string = (import.meta as any).env?.VITE_API_URL || '/api';

// DEBUG: log resolved API base URL once on module load
try {
  // Use info level so it is easy to spot
  console.info('[api] Resolved API_URL =', API_URL);
} catch {}

async function apiRequest(path: string, options: RequestInit = {}) {
    const url = `${API_URL}${path}`;
    const headers = new Headers(options.headers || {});

    // Ensure JSON headers by default
    if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
    }

    // Attach CSRF token if present (double submit cookie pattern)
    let csrfToken = document.cookie.split('; ').find(r => r.startsWith('csrf_token='))?.split('=')[1];

    // If this is a state-changing request and we don't have a csrf cookie yet,
    // make a benign GET to prime the cookie (server sets csrf_token on GETs)
    const method = (options.method || 'GET').toUpperCase();
    try {
      console.debug('[apiRequest] →', method, url);
    } catch {}
    if (!csrfToken && ['POST','PUT','PATCH','DELETE'].includes(method)) {
        try {
            await fetch(`${API_URL}/health`, { credentials: 'include' });
        } catch { /* ignore any errors; goal is just to set csrf cookie */ }
        csrfToken = document.cookie.split('; ').find(r => r.startsWith('csrf_token='))?.split('=')[1];
    }

    if (csrfToken) {
        headers.set('X-CSRF-Token', csrfToken);
    }

    const response = await fetch(url, {
        credentials: 'include', // send cookies
        ...options,
        headers,
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    try {
      console.debug('[apiRequest] ←', method, url, 'status:', response.status, 'content-type:', contentType || '(none)');
    } catch {}
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok) {
        const message = isJson
          ? ((payload as any)?.error?.message || (payload as any)?.message || (Array.isArray((payload as any)?.errors) ? (payload as any).errors.join(', ') : 'Unknown error'))
          : (typeof payload === 'string' ? (payload as string).slice(0, 200) + '…' : 'Error');
        
        // Create enhanced error with additional context
        const error = new Error(message);
        (error as any).response = { status: response.status, data: payload };
        (error as any).status = response.status;
        (error as any).url = url;
        (error as any).method = method;
        
        throw error;
    }

    // Unwrap global ApiResponse wrapper { success, data, ... } if present
    if (isJson && payload && typeof payload === 'object') {
        const obj: any = payload as any;
        const hasSuccess = Object.prototype.hasOwnProperty.call(obj, 'success');
        const hasData = Object.prototype.hasOwnProperty.call(obj, 'data');
        if (hasSuccess && obj.success === true && hasData) {
            return obj.data;
        }
        if (hasSuccess && obj.success === false) {
            const message = obj.error?.message || obj.message || 'Request failed';
            throw new Error(message);
        }
    }

    return payload;
}

// Helper function to transform backend class response to frontend Class type
function transformBackendClass(backendClass: any): Class {
    return {
        id: backendClass.id || backendClass._id,
        name: backendClass.name,
        headTeacherId: backendClass.headTeacherId?.id || backendClass.headTeacherId?._id || backendClass.headTeacherId,
    };
}

// Helper function to normalize ActionPreset from backend
function transformBackendActionPreset(p: any): ActionPreset {
    return {
        id: p?.id || p?._id,
        name: p?.name,
        type: p?.type,
        points: p?.points,
        category: p?.category,
        description: p?.description,
        badgeTier: p?.badgeTier,
        icon: p?.icon,
        isArchived: !!p?.isArchived,
        createdBy: (p?.createdBy && typeof p.createdBy === 'object')
            ? (p.createdBy.id || p.createdBy._id)
            : p?.createdBy,
    } as ActionPreset;
}

// --- AUTH OPERATIONS ---

// Helper function to transform backend user response to frontend User type
function transformBackendUser(backendUser: any): User {
    if (!backendUser || typeof backendUser !== 'object') {
        throw new Error('Invalid user data from server.');
    }
    return {
        id: backendUser.id || backendUser._id,
        name: backendUser.firstName && backendUser.lastName 
            ? `${backendUser.firstName} ${backendUser.lastName}` 
            : backendUser.nisn || 'Unknown User',
        nisn: backendUser.nisn || '',
        firstName: backendUser.firstName,
        lastName: backendUser.lastName,
        role: (backendUser.roles && backendUser.roles[0]) || 'student',
        roles: backendUser.roles || [(backendUser.roles && backendUser.roles[0]) || 'student'],
        classId: backendUser.classId?._id || backendUser.classId,
        className: backendUser.classId?.name || '',
        subject: backendUser.subject,
        contactNumber: backendUser.contactNumber,
        childIds: backendUser.childIds,
        isArchived: backendUser.isArchived,
        points: backendUser.points || 0
    };
}

export async function login(identifier: string, password: string): Promise<User> {
  // Use NISN for authentication
  const body = JSON.stringify({ nisn: identifier, password });
  const result = await apiRequest('/auth/login', { method: 'POST', body });
  if (result && typeof result === 'object') {
    if ('user' in result && (result as any).user) {
      return transformBackendUser((result as any).user);
    }
    if ('id' in result) {
      return transformBackendUser(result);
    }
  }
  throw new Error('Login failed: unexpected server response.');
}

export const getProfile = async (): Promise<User> => {
  const profile = await apiRequest('/auth/profile');
  if (!profile) {
    throw new Error('Failed to load profile');
  }
  return transformBackendUser(profile);
};

export async function logout(): Promise<void> {
  await apiRequest('/auth/logout', { method: 'POST' });
}

// --- READ OPERATIONS (Granular & Paginated) ---

export const getStudentDashboardData = async (params?: { year: string }): Promise<any> => {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    const data = await apiRequest(`/dashboards/student?${query}`);
    
    // Transform user data to ensure consistent frontend format
    if (data.leaderboardUsers) {
        data.leaderboardUsers = data.leaderboardUsers.map(transformBackendUser);
    }
    if (data.users) {
        data.users = data.users.map(transformBackendUser);
    }
    
    return data;
};

export const getTeacherDashboardData = async (params?: { year: string }): Promise<any> => {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    const data = await apiRequest(`/dashboards/teacher?${query}`);
    
    // Transform user data to ensure consistent frontend format
    if (data.students) {
        data.students = data.students.map(transformBackendUser);
    }
    if (data.users) {
        data.users = data.users.map(transformBackendUser);
    }
    
    return data;
};

export const getParentDashboardData = (params?: { year: string }): Promise<any> => {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    return apiRequest(`/dashboards/parent?${query}`);
};

// Academic years for filtering (admin)
export const getAvailableYears = async (): Promise<string[]> => {
    const years = await apiRequest('/data/academic-years');
    return Array.isArray(years) ? years : [];
};

export const getAdminDashboardData = async (params?: { year: string }): Promise<any> => {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    const response = await apiRequest(`/dashboards/admin?${query}`);
    
    // Handle nested data structure: response might be { data: { users: [...], ... } }
    const data = response.data || response;
    
    // Normalize users for frontend consumption
    if (data && Array.isArray(data.users)) {
        data.users = data.users.filter(Boolean).map((u: any) => transformBackendUser(u));
    }
    return data;
};

// --- LIST FETCHES ---

export const getAppeals = (params: any): Promise<{ appeals: Appeal[], total: number }> => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/appeals?${query}`);
};

export const getTeacherReports = (params: any): Promise<{ reports: TeacherReport[], total: number }> => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/teacher-reports?${query}`);
};

export const getClasses = async (): Promise<Class[]> => {
    // Fetch all classes by setting a high limit (backend max is 100)
    const response = await apiRequest('/classes?limit=100');
    const classes = (response?.classes || []).map((c: any) => transformBackendClass(c));
    console.log('getClasses: API response:', response);
    console.log('getClasses: Transformed classes:', classes);
    return classes;
};

export const getActionPresets = async (): Promise<ActionPreset[]> => {
    const response = await apiRequest('/action-presets?limit=100');
    // Backend returns paginated response: { data: ActionPreset[], pagination: {...} }
    const items = response?.data ?? [];
    return (Array.isArray(items) ? items : []).map((p: any) => transformBackendActionPreset(p));
};

export const getUsers = async (params: any): Promise<{ users: User[]; total: number }> => {
    const query = new URLSearchParams(params).toString();
    const response = await apiRequest(`/users?${query}`);
    const rawUsers = (response?.users ?? response ?? []);
    const list = Array.isArray(rawUsers) ? rawUsers : [];
    const users = list.filter(Boolean).map((u: any) => transformBackendUser(u));
    return { users, total: response?.total ?? users.length };
};

// --- ACTIONS (mutations) ---

export const addPointLog = async (log: Omit<PointLog, 'id' | 'timestamp' | 'addedBy' | 'academicYear'>): Promise<PointLog> => {
    const created = await apiRequest('/points', { method: 'POST', body: JSON.stringify(log) });
    return { ...created, id: created.id || created._id } as PointLog;
};

export const updatePointLog = async (id: string, updates: Partial<PointLog>): Promise<PointLog> => {
    const updated = await apiRequest(`/point-logs/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    return { ...updated, id: updated.id || updated._id } as PointLog;
};

export const deletePointLog = async (id: string): Promise<void> => {
    await apiRequest(`/point-logs/${id}`, { method: 'DELETE' });
};

export const getPointLog = async (id: string): Promise<PointLog> => {
    const pointLog = await apiRequest(`/point-logs/${id}`);
    return { ...pointLog, id: pointLog.id || pointLog._id } as PointLog;
};

export const getPointLogs = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  studentId?: string;
  category?: string;
  addedBy?: string;
  badgeTier?: string;
  academicYear?: string;
  minPoints?: number;
  maxPoints?: number;
}): Promise<{ data: PointLog[]; total: number; page: number; limit: number; totalPages: number }> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  const response = await apiRequest(`/point-logs?${queryParams.toString()}`);
  return response;
};

export const createQuest = async (quest: Omit<Quest, 'id' | 'createdAt' | 'createdBy' | 'academicYear'>): Promise<Quest> => {
    const created = await apiRequest('/quests', { method: 'POST', body: JSON.stringify(quest) });
    return { ...created, id: created.id || created._id } as Quest;
};

export const updateQuest = async (questId: string, updates: Partial<Quest>): Promise<Quest> => {
    const updated = await apiRequest(`/quests/${questId}`, { method: 'PATCH', body: JSON.stringify(updates) });
    return { ...updated, id: updated.id || updated._id } as Quest;
};

export const deleteQuest = async (questId: string): Promise<Quest> => {
    const deleted = await apiRequest(`/quests/${questId}` , { method: 'DELETE' });
    return { ...deleted, id: deleted.id || deleted._id } as Quest;
};

export const joinQuest = async (questId: string): Promise<QuestParticipant> => {
    const joined = await apiRequest(`/quests/${questId}/join`, { method: 'POST' });
    return { ...joined, id: joined.id || joined._id } as QuestParticipant;
};

export const submitQuestForReview = async (questId: string): Promise<QuestParticipant> => {
    const submitted = await apiRequest(`/quests/${questId}/submit`, { method: 'POST' });
    return { ...submitted, id: submitted.id || submitted._id } as QuestParticipant;
};

export const reviewQuestCompletion = async (params: { questId: string; studentId: string; isApproved: boolean; reviewNotes?: string; }): Promise<{ updatedParticipant: QuestParticipant, pointLog: PointLog | null }> => {
    const { questId, studentId, isApproved, reviewNotes } = params;
    const result = await apiRequest(`/quests/${questId}/review`, { method: 'POST', body: JSON.stringify({ studentId, isApproved, reviewNotes }) });
    return { updatedParticipant: result.updatedParticipant, pointLog: result.pointLog };
};

export const submitAppeal = async (appeal: Pick<Appeal, 'pointLogId' | 'reason'>): Promise<Appeal> => {
    const created = await apiRequest('/appeals', { method: 'POST', body: JSON.stringify(appeal) });
    return { ...created, id: created.id || created._id } as Appeal;
};

export const reviewAppeal = async (appealId: string, status: AppealStatus.APPROVED | AppealStatus.REJECTED): Promise<{ updatedAppeal: Appeal, reversedPointLog: PointLog | null }> => {
    const result = await apiRequest(`/appeals/${appealId}/review`, { method: 'POST', body: JSON.stringify({ status }) });
    return { updatedAppeal: result.updatedAppeal, reversedPointLog: result.reversedPointLog };
};

export const withdrawAppeal = async (appealId: string): Promise<void> => {
    await apiRequest(`/appeals/${appealId}/withdraw`, { method: 'POST' });
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
    try {
        // Transform frontend User data to backend CreateUserDto format
        const backendUserData: any = {
            password: userData.password,
        };
        
        // Split name into firstName and lastName if provided
        if (userData.name) {
            const nameParts = userData.name.trim().split(' ');
            backendUserData.firstName = nameParts[0] || '';
            backendUserData.lastName = nameParts.slice(1).join(' ') || '';
        }
        
        // Map other fields
        if (userData.nisn) backendUserData.nisn = userData.nisn;
        if (userData.role) backendUserData.roles = [userData.role];
        if (userData.classId) backendUserData.classId = userData.classId;
        if (userData.contactNumber) {
            backendUserData.profile = {
                phone: userData.contactNumber
            };
        }
        
        const created = await NetworkErrorHandler.withRetry(
            () => apiRequest('/users', { method: 'POST', body: JSON.stringify(backendUserData) }),
            {
                maxRetries: 2,
                retryDelay: 1000,
                onRetry: (attempt, error) => {
                    // Retry attempt due to error
                }
            }
        );
        
        return transformBackendUser(created);
    } catch (error) {
        // Enhanced error handling with better classification
        const enhancedError = await ErrorHandler.handleError(error, {
            operation: 'createUser',
            userData: { ...userData, password: '[REDACTED]' }
        });
        
        // Re-throw with enhanced context but preserve original error for existing error handling
        const enhancedErrorObj = new Error(enhancedError.message);
        (enhancedErrorObj as any).response = (error as any).response;
        (enhancedErrorObj as any).status = (error as any).status;
        (enhancedErrorObj as any).enhancedError = enhancedError;
        
        throw enhancedErrorObj;
    }
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
    // Transform frontend User data to backend UpdateUserDto format
    const backendUpdates: any = { ...updates };
    
    // Split name into firstName and lastName if provided
    if (updates.name !== undefined) {
        const nameParts = updates.name.trim().split(' ');
        backendUpdates.firstName = nameParts[0] || '';
        backendUpdates.lastName = nameParts.slice(1).join(' ') || '';
        delete backendUpdates.name; // Remove the name field
    }
    
    // Transform role to roles array if provided
    if (updates.role !== undefined) {
        backendUpdates.roles = [updates.role];
        delete backendUpdates.role;
    }
    
    // Transform contactNumber to profile.phone if provided
    if (updates.contactNumber !== undefined) {
        backendUpdates.profile = backendUpdates.profile || {};
        backendUpdates.profile.phone = updates.contactNumber;
        delete backendUpdates.contactNumber;
    }
    
    const updated = await apiRequest(`/users/${userId}`, { method: 'PATCH', body: JSON.stringify(backendUpdates) });
    return transformBackendUser(updated);
};

export const archiveUser = async (userId: string): Promise<User> => {
    const updated = await apiRequest(`/users/${userId}/archive`, { method: 'POST' });
    return transformBackendUser(updated);
};

export const restoreUser = async (userId: string): Promise<User> => {
    const updated = await apiRequest(`/users/${userId}/restore`, { method: 'POST' });
    return transformBackendUser(updated);
};

export const createActionPreset = async (preset: Omit<ActionPreset, 'id' | 'createdBy' | 'isArchived'>): Promise<ActionPreset> => {
    const created = await apiRequest('/action-presets', { method: 'POST', body: JSON.stringify(preset) });
    return transformBackendActionPreset(created);
};

export const updateActionPreset = async (presetId: string, updates: Partial<ActionPreset>): Promise<ActionPreset> => {
    const updated = await apiRequest(`/action-presets/${presetId}`, { method: 'PATCH', body: JSON.stringify(updates) });
    return transformBackendActionPreset(updated);
};

export const deleteActionPreset = async (presetId: string): Promise<void> => {
    await apiRequest(`/action-presets/${presetId}`, { method: 'DELETE' });
};

export const submitTeacherReport = async (reportData: Omit<TeacherReport, 'id' | 'timestamp' | 'status' | 'submittedByUserId' | 'academicYear'>): Promise<TeacherReport> => {
    const created = await apiRequest('/teacher-reports', { method: 'POST', body: JSON.stringify(reportData) });
    return { ...created, id: created.id || created._id } as TeacherReport;
};

export const reviewTeacherReport = async (reportId: string): Promise<TeacherReport> => {
    const updated = await apiRequest(`/teacher-reports/${reportId}/review`, { method: 'POST' });
    return { ...updated, id: updated.id || updated._id } as TeacherReport;
};

export const updateTeacherReport = async (reportId: string, updates: Partial<TeacherReport>): Promise<TeacherReport> => {
    const updated = await apiRequest(`/teacher-reports/${reportId}`, { method: 'PATCH', body: JSON.stringify(updates) });
    return { ...updated, id: updated.id || updated._id } as TeacherReport;
};

export const createClass = async (classData: Omit<Class, 'id'>): Promise<Class> => {
    const created = await apiRequest('/classes', { method: 'POST', body: JSON.stringify(classData) });
    return transformBackendClass(created);
};

export const updateClass = async (classId: string, updates: Partial<Class>): Promise<Class> => {
    const updated = await apiRequest(`/classes/${classId}`, { method: 'PATCH', body: JSON.stringify(updates) });
    return transformBackendClass(updated);
};

export const deleteClass = async (classId: string): Promise<void> => {
    await apiRequest(`/classes/${classId}`, { method: 'DELETE' });
};

// --- NOTIFICATIONS ---
export const getNotifications = async (params?: any): Promise<Notification[]> => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await apiRequest(`/notifications${query}`);
    const items = (response?.data ?? response?.notifications ?? response ?? []);
    return Array.isArray(items) ? items : [];
};

export const markNotificationsAsRead = async (ids: string[]): Promise<void> => {
    // Use individual mark-read endpoint for each id to align with backend
    await Promise.all(ids.map(id => apiRequest(`/notifications/${id}/mark-read`, { method: 'PATCH' })));
};

// --- AUDIT LOGS ---
export const addAuditLog = async (action: string, details?: Record<string, any>): Promise<void> => {
    await apiRequest('/audit-logs', { method: 'POST', body: JSON.stringify({ action, details }) });
};

// --- BULK ACTIONS ---
export const addBulkAction = async (
    classId: string,
    action: { type: 'points', points: number, category: string, description: string } | { type: 'badge', presetId: string }
): Promise<void> => {
    // Backend expects POST /data/bulk-action with body { classId, action }
    await apiRequest(`/data/bulk-action`, { method: 'POST', body: JSON.stringify({ classId, action }) });
};

// --- HEALTH CHECKS ---
export const getHealthFull = async (): Promise<any> => {
    const response = await apiRequest('/health/full');
    return response;
};

export const getIntegrityReport = async (): Promise<any> => {
    const response = await apiRequest('/health/integrity');
    return response;
};

// --- AWARDS OPERATIONS ---

// Helper function to transform backend award response to frontend Award type
function transformBackendAward(backendAward: any): Award {
    return {
        id: backendAward.id || backendAward._id,
        name: backendAward.name,
        description: backendAward.description,
        type: backendAward.type,
        tier: backendAward.tier,
        icon: backendAward.icon,
        status: backendAward.status,
        recipientId: backendAward.recipientId?._id || backendAward.recipientId,
        recipientName: backendAward.recipientId?.name || backendAward.recipientName,
        awardedBy: backendAward.awardedBy?._id || backendAward.awardedBy,
        awardedByName: backendAward.awardedBy?.name || backendAward.awardedByName,
        awardedOn: new Date(backendAward.awardedOn),
        reason: backendAward.reason,
        academicYear: backendAward.academicYear,
        metadata: backendAward.metadata,
        createdAt: backendAward.createdAt ? new Date(backendAward.createdAt) : undefined,
        updatedAt: backendAward.updatedAt ? new Date(backendAward.updatedAt) : undefined,
    };
}

export const getAwards = async (params: any): Promise<{ awards: Award[], total: number }> => {
    // Filter out undefined values to prevent validation errors
    const filteredParams: Record<string, string> = {};
    Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            filteredParams[key] = String(value);
        }
    });
    const query = new URLSearchParams(filteredParams).toString();
    const response = await apiRequest(`/awards?${query}`);
    return {
        awards: response.awards?.map(transformBackendAward) || [],
        total: response.total || 0,
    };
};

export const getAward = async (id: string): Promise<Award> => {
    const response = await apiRequest(`/awards/${id}`);
    return transformBackendAward(response);
};

export const createAward = async (awardData: {
    name: string;
    description: string;
    type: AwardType;
    tier: AwardTier;
    icon: string;
    recipientId?: string;
    reason?: string;
    academicYear?: string;
    metadata?: Record<string, any>;
}): Promise<Award> => {
    const response = await apiRequest('/awards', {
        method: 'POST',
        body: JSON.stringify({
            name: awardData.name,
            description: awardData.description,
            tier: awardData.tier,
            icon: awardData.icon,
            recipientId: awardData.recipientId,
            reason: awardData.reason,
            academicYear: awardData.academicYear,
            metadata: awardData.metadata
        }),
    });
    return transformBackendAward(response);
};

export const updateAward = async (id: string, awardData: {
    name?: string;
    description?: string;
    type?: AwardType;
    tier?: AwardTier;
    icon?: string;
    status?: AwardStatus;
    reason?: string;
    academicYear?: string;
    metadata?: Record<string, any>;
}): Promise<Award> => {
    // Filter out the 'type' field as it's not accepted by the backend
    const { type, ...requestData } = awardData;
    const response = await apiRequest(`/awards/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(requestData),
    });
    return transformBackendAward(response);
};

export const revokeAward = async (id: string, reason: string): Promise<Award> => {
    const response = await apiRequest(`/awards/${id}/revoke`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
    });
    return transformBackendAward(response);
};

export const deleteAward = async (id: string): Promise<void> => {
    await apiRequest(`/awards/${id}`, { method: 'DELETE' });
};

export const getAwardStats = async (params?: {
    type?: AwardType;
    tier?: AwardTier;
    status?: AwardStatus;
    academicYear?: string;
    startDate?: string;
    endDate?: string;
}): Promise<AwardStats> => {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    return apiRequest(`/awards/statistics?${query}`);
};

export const getAwardsByRecipient = async (recipientId: string, params?: any): Promise<{ awards: Award[], total: number }> => {
    const query = params ? new URLSearchParams(params).toString() : '';
    const response = await apiRequest(`/awards/recipient/${recipientId}?${query}`);
    return {
        awards: response.awards?.map(transformBackendAward) || [],
        total: response.total || 0,
    };
};

// Award Templates API
export const getAwardTemplates = async (): Promise<Award[]> => {
    const response = await apiRequest('/awards/templates');
    return (Array.isArray(response) ? response : []).map((award: any) => transformBackendAward(award));
};

export const createAwardTemplate = async (templateData: {
    name: string;
    description: string;
    type: AwardType;
    tier: AwardTier;
    icon: string;
    reason?: string;
    templateName: string;
    metadata?: Record<string, any>;
}): Promise<Award> => {
    const response = await apiRequest('/awards', {
        method: 'POST',
        body: JSON.stringify({
            name: templateData.name,
            description: templateData.description,
            tier: templateData.tier,
            icon: templateData.icon,
            reason: templateData.reason || templateData.description,
            isTemplate: true,
            templateName: templateData.templateName,
            metadata: templateData.metadata
        }),
    });
    return transformBackendAward(response);
};

export const createAwardFromTemplate = async (templateId: string, recipientId: string): Promise<Award> => {
    const response = await apiRequest(`/awards/template/${templateId}/create`, {
        method: 'POST',
        body: JSON.stringify({ recipientId }),
    });
    return transformBackendAward(response);
};

// Leaderboard API
export const getLeaderboard = async (limit: number = 30): Promise<any[]> => {
    const query = new URLSearchParams({ limit: limit.toString() }).toString();
    return apiRequest(`/awards/leaderboard?${query}`);
};

// --- DANGEROUS OPERATIONS (RESTRICTED) ---
export const deleteUser = async (userId: string): Promise<void> => {
    await apiRequest(`/users/${userId}`, { method: 'DELETE' });
};

export const deleteBadge = async (badgeId: string): Promise<{ deletedBadge: string; affectedUsers: number }> => {
    const response = await apiRequest(`/admin/badge/${badgeId}`, { method: 'DELETE' });
    return response;
};



export const bulkDeleteUsers = async (userIds: string[]): Promise<void> => {
    await apiRequest('/admin/bulk-delete-users', { 
        method: 'POST', 
        body: JSON.stringify({ userIds }) 
    });
};

export const emergencySystemReset = async (): Promise<void> => {
    // Emergency system reset - use with extreme caution
    await apiRequest('/admin/emergency-reset', { method: 'POST' });
};