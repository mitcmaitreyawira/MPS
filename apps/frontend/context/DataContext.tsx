

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import * as api from '../services/api';
import { User, PointLog, Quest, Appeal, AuditLog, Class, QuestParticipant, Badge, BadgeTier, PointType, AppealStatus, UserRole, ActionPreset, TeacherReport, ReportStatus, ActionType, QuestCompletionStatus, Notification } from '../types';
import { useAuth } from './AuthContext';
import { dataCache, CacheKeys, CacheInvalidation } from '../utils/dataCache';
import { ErrorHandler, ErrorClassifier, ErrorType } from '../utils/errorHandling';
import { OptimizedDataFetcher, prefetchDashboardData, warmCache, invalidateRelatedData } from '../utils/optimizedDataFetcher';
// Removed unused DuplicateDetectionService import

interface DataContextType {
    // Shared, small, and relatively static data
    classes: Class[];
    actionPresets: ActionPreset[];
    notifications: Notification[];
    users: User[]; // All users, useful for popovers, selectors, etc.
    
    // Academic Year state
    availableYears: string[];
    selectedYear: string;
    isViewingPastYear: boolean;
    
    // Data Loading status for shared data
    loading: boolean;
    
    // Actions
    setSelectedYear: (year: string) => void;
    addPointLog: (log: Omit<PointLog, 'id' | 'timestamp' | 'addedBy' | 'academicYear'>, badgeInfo?: { tier: BadgeTier; reason: string; icon?: string; }) => Promise<PointLog>;
    updatePointLog: (pointLogId: string, updates: Partial<PointLog>) => Promise<PointLog>;
    deletePointLog: (pointLogId: string) => Promise<void>;
    getPointLog: (pointLogId: string) => Promise<PointLog>;
    createQuest: (quest: Omit<Quest, 'id' | 'createdAt' | 'createdBy' | 'academicYear'>) => Promise<Quest>;
    updateQuest: (questId: string, updates: Partial<Quest>) => Promise<Quest>;
    deleteQuest: (questId: string) => Promise<Quest>;
    joinQuest: (questId: string) => Promise<QuestParticipant>;
    submitQuestForReview: (questId: string) => Promise<QuestParticipant>;
    reviewQuestCompletion: (questId: string, studentId: string, isApproved: boolean, reviewNotes?: string) => Promise<{ updatedParticipant: QuestParticipant, pointLog: PointLog | null }>;
    submitAppeal: (appeal: Pick<Appeal, 'pointLogId' | 'reason'>) => Promise<Appeal>;
    reviewAppeal: (appealId: string, status: AppealStatus.APPROVED | AppealStatus.REJECTED) => Promise<{ updatedAppeal: Appeal, reversedPointLog: PointLog | null }>;
    withdrawAppeal: (appealId: string) => Promise<void>;
    createUser: (user: Omit<User, 'id'>) => Promise<User>;
    updateUser: (userId: string, updates: Partial<User>) => Promise<User>;
    deleteUser: (userId: string) => Promise<void>;
    archiveUser: (userId: string) => Promise<User>;
    restoreUser: (userId: string) => Promise<User>;
    createActionPreset: (preset: Omit<ActionPreset, 'id' | 'createdBy' | 'isArchived'>) => Promise<ActionPreset>;
    updateActionPreset: (presetId: string, updates: Partial<ActionPreset>) => Promise<ActionPreset>;
    deleteActionPreset: (presetId: string) => Promise<void>;
    submitTeacherReport: (reportData: Omit<TeacherReport, 'id' | 'timestamp' | 'status' | 'submittedByUserId' | 'academicYear'>) => Promise<TeacherReport>;
    reviewTeacherReport: (reportId: string) => Promise<TeacherReport>;
    updateTeacherReport: (reportId: string, updates: Partial<TeacherReport>) => Promise<TeacherReport>;
    createClass: (classData: Omit<Class, 'id'>) => Promise<Class>;
    updateClass: (classId: string, updates: Partial<Class>) => Promise<Class>;
    deleteClass: (classId: string) => Promise<void>;
    addBulkAction: (classId: string, action: { type: 'points', points: number, category: string, description: string } | { type: 'badge', presetId: string }) => Promise<void>;
    markAsRead: (notificationIds: string[]) => Promise<void>;
    addAuditLog: (action: string, details: Record<string, any>) => Promise<void>;
    refetchSharedData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    
    // State is now limited to small, globally used data sets.
    const [classes, setClasses] = useState<Class[]>([]);
    const [actionPresets, setActionPresets] = useState<ActionPreset[]>([
        {
            id: 'preset-1',
            type: ActionType.REWARD,
            name: 'Excellent Participation',
            category: 'Participation',
            points: 10,
            description: 'Outstanding participation in class discussion',
            isArchived: false,
            createdBy: 'admin'
        },
        {
            id: 'preset-2',
            type: ActionType.REWARD,
            name: 'Homework Completion',
            category: 'Academic',
            points: 15,
            description: 'Completed homework on time with quality work',
            isArchived: false,
            createdBy: 'admin'
        },
        {
            id: 'preset-3',
            type: ActionType.VIOLATION,
            name: 'Late Submission',
            category: 'Academic',
            points: -5,
            description: 'Assignment submitted after deadline',
            isArchived: false,
            createdBy: 'admin'
        },
        {
            id: 'preset-4',
            type: ActionType.VIOLATION,
            name: 'Disruptive Behavior',
            category: 'Behavior',
            points: -10,
            description: 'Disrupting class or other students',
            isArchived: false,
            createdBy: 'admin'
        },
        {
            id: 'preset-5',
            type: ActionType.REWARD,
            name: 'Leadership Award',
            category: 'Leadership',
            points: 25,
            description: 'Demonstrated exceptional leadership qualities',
            badgeTier: BadgeTier.GOLD,
            icon: '👑',
            isArchived: false,
            createdBy: 'admin'
        }
    ]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    
    // Academic Year State
    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState('current');
    const [isViewingPastYear, setIsViewingPastYear] = useState(false);

    const addAuditLog = useCallback(async (action: string, details: Record<string, any>) => {
        if (!user || user.role === UserRole.SUPER_SECRET_ADMIN) return;
        try {
            await api.addAuditLog(action, details);
        } catch(error) {
            console.error("Failed to add audit log", error);
        }
    }, [user]);
    
    // Fetch only the essential, shared data on load.
    const fetchSharedData = useCallback(async (forceRefresh = false) => {
        console.log('DataContext: fetchSharedData called with forceRefresh:', forceRefresh);
        setLoading(true);
        try {
            console.log('DataContext: Starting to fetch shared data...');
            console.log('DataContext: Current user:', user);
            console.log('DataContext: User authenticated:', !!user);
            console.log('DataContext: Force refresh:', forceRefresh);
            
            // Prefetch dashboard data based on user role
            if (user?.role) {
                prefetchDashboardData(user.role, selectedYear);
                warmCache(user.role, []); // Could be enhanced with actual recently viewed data
            }
            
            // Use optimized data fetcher with deduplication and intelligent caching
             const fetchWithCache = async function<T>(apiCall: () => Promise<T>, cacheKey: string, ttl = 5 * 60 * 1000): Promise<T> {
                 return OptimizedDataFetcher.fetchWithDeduplication(cacheKey, apiCall, ttl, forceRefresh);
             };
 
             // Fetch data based on user role to avoid permission errors
             
             // Base data that all users can access
             console.log('DataContext: About to fetch base data (classes and action presets)');
             const basePromises = [
                 api.getClasses(), // Always fetch fresh classes data
                 fetchWithCache(() => {
                     console.log('DataContext: Calling api.getActionPresets()');
                     return api.getActionPresets();
                 }, CacheKeys.actionPresets()),
             ];
             console.log('DataContext: Base promises created:', basePromises.length);
             
             // Role-specific data fetching
             let userDataPromises: Promise<any>[] = [];
             
             if (user?.role === UserRole.SUPER_SECRET_ADMIN || user?.role === UserRole.ADMIN) {
                  // Admins can fetch all users in a single call
                  userDataPromises = [
                      fetchWithCache(() => api.getUsers({ limit: 1000, includeArchived: true }), CacheKeys.users())
                  ];
              } else if (user?.role === UserRole.TEACHER || user?.role === UserRole.HEAD_OF_CLASS) {
                  // Teachers can fetch students and other teachers
                  userDataPromises = [
                      fetchWithCache(() => api.getUsers({ role: 'student', limit: 100, includeArchived: true }), CacheKeys.users({ role: 'student' })),
                      fetchWithCache(() => api.getUsers({ role: 'teacher', limit: 100, includeArchived: true }), CacheKeys.users({ role: 'teacher' })),
                  ];
              } else {
                  // Students can fetch teachers for class creation and other forms
                  userDataPromises = [
                      fetchWithCache(() => api.getUsers({ role: 'teacher', limit: 100, includeArchived: true }), CacheKeys.users({ role: 'teacher' })),
                  ];
              }
             
             const allPromises = [...basePromises, ...userDataPromises];
             const results = await Promise.all(allPromises);
             
             console.log('API Results:', results.map((result, index) => ({
                 index,
                 data: result
             })));
             
             const [fetchedClasses, fetchedActionPresets, ...userDataResults] = results;
             
             console.log('DataContext: Fetched action presets:', fetchedActionPresets);
             console.log('DataContext: Action presets type:', typeof fetchedActionPresets);
             console.log('DataContext: Action presets length:', Array.isArray(fetchedActionPresets) ? fetchedActionPresets.length : 'not array');
             
             // Additional debugging for action presets API response
             console.log('DataContext: Setting action presets in state:', fetchedActionPresets);
             console.log('DataContext: Action presets API call successful:', !!fetchedActionPresets);
             
             // Combine user data if any was fetched and ensure consistent name field
             let allUsers: User[] = [];
             if (userDataResults.length > 0) {
                 let rawUsers: User[] = [];
                 if (user?.role === UserRole.SUPER_SECRET_ADMIN || user?.role === UserRole.ADMIN) {
                     // For admins, we have a single response with all users
                     rawUsers = userDataResults[0]?.users || [];
                 } else {
                     // For other roles, combine multiple role-specific responses
                     const allUsersWithDuplicates = userDataResults.flatMap(result => result?.users || []);
                     rawUsers = allUsersWithDuplicates.filter((user, index, array) => 
                         array.findIndex(u => u.id === user.id) === index
                     );
                 }
                 
                 // Ensure all users have consistent name field and role properties for search functionality
                 allUsers = rawUsers.map(user => ({
                     ...user,
                     name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.nisn || 'Unknown User',
                     // Preserve roles array from API and create backward-compatible role property
                     roles: user.roles || [],
                     role: user.roles?.[0] === 'admin' ? UserRole.ADMIN : 
                           user.roles?.[0] === 'teacher' ? UserRole.TEACHER : 
                           user.roles?.[0] === 'head_teacher' ? UserRole.TEACHER :
                           user.roles?.[0] === 'head_of_class' ? UserRole.HEAD_OF_CLASS :
                           UserRole.STUDENT
                 }));
             }
            setClasses(fetchedClasses);
            console.log('DataContext: About to set action presets:', fetchedActionPresets);
            setActionPresets(fetchedActionPresets);
            console.log('DataContext: Action presets set in state');
            setUsers(allUsers);
        } catch (error) {
            // Handle authentication and authorization errors gracefully
            if ((error as any).status === 401) {
                console.warn("DataContext: Authentication error - user needs to login");
                // Clear user session and redirect to login
                throw error;
            } else if ((error as any).status === 403) {
                console.warn("DataContext: Authorization error - insufficient role permissions");
                console.log("DataContext: User role:", user?.role, "User roles:", user?.roles);
                
                // For role permission errors, we'll continue with partial data
                // This allows the UI to show what the user can access
                console.log("DataContext: Continuing with partial data due to role restrictions");
                
                // Set empty arrays for data that couldn't be fetched due to permissions
                // but don't throw the error to allow the app to continue functioning
                setClasses([]);
                setActionPresets([]);
                setUsers([]);
                return; // Exit gracefully without throwing
            }
            
            // Only log unexpected errors (not 401/403 which we handle gracefully)
            console.error("DataContext: Failed to fetch shared data", error);
            console.error("DataContext: Error details:", {
                message: (error as Error).message,
                status: (error as any).status,
                url: (error as any).url,
                method: (error as any).method
            });
            
            // For other errors, ensure arrays remain as arrays
            setClasses([]);
            setActionPresets([]);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Effect to fetch initial shared data and available years.
    useEffect(() => {
        console.log('DataContext: useEffect triggered, user:', user);
        console.log('DataContext: User role:', user?.role);
        if (user) {
            console.log('DataContext: User authenticated, calling fetchSharedData');
            fetchSharedData();
            if (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_SECRET_ADMIN) {
                api.getAvailableYears().then(setAvailableYears);
            }
        } else {
            console.log('DataContext: No user authenticated, skipping data fetch');
        }
    }, [fetchSharedData, user]);
    
    // Update isViewingPastYear flag when year selection changes
    useEffect(() => {
        if (availableYears.length > 0) {
            // Create a copy of the array before sorting to avoid mutating state directly.
            const currentAcademicYear = [...availableYears].sort().reverse()[0];
            setIsViewingPastYear(selectedYear !== 'current' && selectedYear !== currentAcademicYear);
        } else {
             setIsViewingPastYear(false);
        }
    }, [selectedYear, availableYears]);

    // Notification Polling, Data Clearing on Logout, and Real-time Data Sync
    useEffect(() => {
        if (!user) {
            // Clear all data on logout
            setClasses([]);
            setActionPresets([]);
            setNotifications([]);
            setUsers([]);
            return;
        }

        const fetchNotifications = async () => {
            try {
                setNotifications(await api.getNotifications());
            } catch (error) {
                // Handle authorization errors gracefully for notifications
                if ((error as any).status === 403) {
                    console.warn("DataContext: Insufficient role permissions for notifications - continuing without notifications");
                    setNotifications([]);
                    return;
                }
                console.error("Failed to poll notifications", error);
            }
        };

        // Listen for cache invalidation events to refresh data in real-time
        const handleDataInvalidation = (event: CustomEvent) => {
            const { type } = event.detail;
            console.log(`DataContext: Received invalidation event for ${type}`);
            
            // Refresh relevant data based on invalidation type
            if (type === 'all' || type === 'users' || type === 'classes' || type === 'presets' || type === 'dashboard') {
                console.log('DataContext: Refreshing shared data due to invalidation');
                fetchSharedData(true); // Force refresh
            }
        };

        // Add event listener for data invalidation
        window.addEventListener('dataInvalidated', handleDataInvalidation as EventListener);

        fetchNotifications(); // Initial fetch
        const intervalId = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
        
        // Also refresh shared data periodically to ensure synchronization
        const dataRefreshInterval = setInterval(() => {
            console.log('DataContext: Periodic data refresh');
            fetchSharedData(true);
        }, 5 * 60 * 1000); // Refresh every 5 minutes

        return () => {
            clearInterval(intervalId);
            clearInterval(dataRefreshInterval);
            window.removeEventListener('dataInvalidated', handleDataInvalidation as EventListener);
        }; // Cleanup on unmount or user change
    }, [user]);

    const markAsRead = useCallback(async (ids: string[]) => {
        if (ids.length === 0) return;
        const optimisticNotifications = notifications.map(n => ids.includes(n.id) ? { ...n, isRead: true } : n);
        setNotifications(optimisticNotifications);
        try {
            await api.markNotificationsAsRead(ids);
        } catch (error) {
            console.error("Failed to mark notifications as read", error);
            // Revert on failure
            setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, isRead: false } : n));
        }
    }, [notifications]);
    
    // --- All action functions are wrapped in useCallback to ensure referential stability ---

    const addPointLog = useCallback(async (log: Omit<PointLog, 'id' | 'timestamp' | 'addedBy' | 'academicYear'>, badgeInfo?: { tier: BadgeTier; reason: string; icon?: string; }): Promise<PointLog> => {
         if (!user) throw new Error("User not authenticated");
         const payload: any = { ...log, addedBy: user.id };
         // If academic year selection is not 'current', include it
         if (selectedYear && selectedYear !== 'current') {
             payload.academicYear = selectedYear;
         }
         const newLog = await api.addPointLog(payload);
         await addAuditLog('ADD_POINT_LOG', { studentId: log.studentId, points: log.points });
         
         // Invalidate relevant caches using optimized invalidation
         invalidateRelatedData('points', log.studentId);
         
         return newLog;
     }, [user, addAuditLog, selectedYear]);
    
    const createQuest = useCallback(async (questData: Omit<Quest, 'id' | 'createdAt' | 'createdBy' | 'academicYear'>): Promise<Quest> => {
        if (!user) throw new Error("Unauthorized");
        const newQuest = await api.createQuest(questData);
        await addAuditLog('CREATE_QUEST', { title: newQuest.title });
        CacheInvalidation.onQuestChange();
        await fetchSharedData(true); // Refresh data after creating quest
        return newQuest;
    }, [user, addAuditLog, fetchSharedData]);
    
    const updateQuest = useCallback(async (questId: string, updates: Partial<Quest>): Promise<Quest> => {
        if (!user) throw new Error("Unauthorized");
        const updatedQuest = await api.updateQuest(questId, updates);
        await addAuditLog('UPDATE_QUEST', { questId, updates });
        CacheInvalidation.onQuestChange();
        await fetchSharedData(true); // Refresh data after updating quest
        return updatedQuest;
    }, [user, addAuditLog, fetchSharedData]);

    const deleteQuest = useCallback(async (questId: string): Promise<Quest> => {
        if (!user) throw new Error("Unauthorized");
        const deletedQuest = await api.deleteQuest(questId);
        await addAuditLog('DELETE_QUEST', { questId, title: deletedQuest.title });
        CacheInvalidation.onQuestChange();
        await fetchSharedData(true); // Refresh data after deleting quest
        return deletedQuest;
     }, [user, addAuditLog, fetchSharedData]);

    const joinQuest = useCallback(async (questId: string): Promise<QuestParticipant> => {
        return api.joinQuest(questId);
    }, []);

    const submitQuestForReview = useCallback(async (questId: string): Promise<QuestParticipant> => {
        return api.submitQuestForReview(questId);
    }, []);
    
    const reviewQuestCompletion = useCallback(async (questId: string, studentId: string, isApproved: boolean, reviewNotes?: string): Promise<{ updatedParticipant: QuestParticipant, pointLog: PointLog | null }> => {
         if (!user) throw new Error("Unauthorized");
         return api.reviewQuestCompletion({ questId, studentId, isApproved, reviewNotes });
     }, [user]);

    const submitAppeal = useCallback(async (appealData: Pick<Appeal, 'pointLogId' | 'reason'>): Promise<Appeal> => {
        if (!user) throw new Error("User not authenticated");
        return api.submitAppeal(appealData);
    }, [user]);
    
    const reviewAppeal = useCallback(async (appealId: string, status: AppealStatus.APPROVED | AppealStatus.REJECTED): Promise<{ updatedAppeal: Appeal, reversedPointLog: PointLog | null }> => {
        if (!user) throw new Error("Unauthorized");
        const result = await api.reviewAppeal(appealId, status);
        await addAuditLog('REVIEW_APPEAL', { appealId, status });
        return result;
    }, [user, addAuditLog]);

    const withdrawAppeal = useCallback(async (appealId: string): Promise<void> => {
        if (!user) throw new Error("Unauthorized");
        return api.withdrawAppeal(appealId);
    }, [user]);

    const createUser = useCallback(async (userData: Omit<User, 'id'>): Promise<User> => {
        if (!user) throw new Error("Unauthorized");
        
        try {
            // Use the new UserCreationService for clean, reliable user creation
            const { UserCreationService } = await import('../services/userCreation.service');
            
            // The service handles email verification and creation internally
            const newUser = await UserCreationService.createUser(userData);
            
            await addAuditLog('CREATE_USER', { newUserName: newUser.name, role: newUser.role });
            
            // Invalidate cache and refresh shared data to ensure UI is updated
            CacheInvalidation.onUserChange();
            await fetchSharedData(true); // Force refresh to update the users list
            
            return newUser;
        } catch (error: any) {
            // Log the error for debugging
            console.error('[DataContext.createUser] Error:', error);
            
            // Re-throw the error with clear message
            const contextError = new Error(error.message || 'Failed to create user');
            (contextError as any).originalError = error;
            (contextError as any).duplicateResults = (error as any).duplicateResults;
            
            throw contextError;
        }
    }, [user, addAuditLog, fetchSharedData, users]);

    const updateUser = useCallback(async (userId: string, updates: Partial<User>): Promise<User> => {
        if (!user) throw new Error("Unauthorized: Not logged in");
        const updatedUser = await api.updateUser(userId, updates);
        await addAuditLog('UPDATE_USER', { userId, updates });
        
        // Update local state to reflect changes immediately
        setUsers(prevUsers => 
            prevUsers.map(u => u.id === userId ? { ...u, ...updatedUser } : u)
        );
        
        CacheInvalidation.onUserChange();
        return updatedUser;
    }, [user, addAuditLog]);

    const archiveUser = useCallback(async (userId: string): Promise<User> => {
        if (!user) throw new Error("Unauthorized");
        const archivedUser = await api.archiveUser(userId);
        await addAuditLog('ARCHIVE_USER', { userId, name: archivedUser.name });
        
        // Update local state to reflect changes immediately
        setUsers(prevUsers => 
            prevUsers.map(u => u.id === userId ? { ...u, ...archivedUser } : u)
        );
        
        CacheInvalidation.onUserChange();
        return archivedUser;
    }, [user, addAuditLog]);

    const deleteUser = useCallback(async (userId: string): Promise<void> => {
        if (!user) throw new Error("Unauthorized: Not logged in");
        await api.deleteUser(userId);
        await addAuditLog('DELETE_USER', { userId });
        
        // Remove user from local state immediately
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
        
        CacheInvalidation.onUserChange();
        await fetchSharedData(true); // Force refresh to ensure consistency
    }, [user, addAuditLog, fetchSharedData]);

    const restoreUser = useCallback(async (userId: string): Promise<User> => {
        if (!user) throw new Error("Unauthorized");
        const restoredUser = await api.restoreUser(userId);
        await addAuditLog('RESTORE_USER', { userId, name: restoredUser.name });
        
        // Update local state to reflect changes immediately
        setUsers(prevUsers => 
            prevUsers.map(u => u.id === userId ? { ...u, ...restoredUser } : u)
        );
        
        CacheInvalidation.onUserChange();
        return restoredUser;
    }, [user, addAuditLog]);

    const createActionPreset = useCallback(async (presetData: Omit<ActionPreset, 'id' | 'createdBy' | 'isArchived'>): Promise<ActionPreset> => {
        if (!user) throw new Error("Unauthorized");
        const newPreset = await api.createActionPreset(presetData);
        await addAuditLog('CREATE_ACTION_PRESET', { name: newPreset.name });
        // Refresh action presets data to show the new preset in the UI
        await fetchSharedData(true);
        return newPreset;
    }, [user, addAuditLog, fetchSharedData]);
    
    const updateActionPreset = useCallback(async (presetId: string, updates: Partial<ActionPreset>): Promise<ActionPreset> => {
        if (!user) throw new Error("Unauthorized");
        const updatedPreset = await api.updateActionPreset(presetId, updates);
        await addAuditLog('UPDATE_ACTION_PRESET', { presetId, updates });
        // Refresh action presets data to show the updated preset in the UI
        await fetchSharedData(true);
        return updatedPreset;
    }, [user, addAuditLog, fetchSharedData]);

    const deleteActionPreset = useCallback(async (presetId: string): Promise<void> => {
        if (!user) throw new Error("Unauthorized");
        await api.deleteActionPreset(presetId);
        await addAuditLog('DELETE_ACTION_PRESET', { presetId });
        // Refresh action presets data to remove the deleted preset from the UI
        await fetchSharedData(true);
    }, [user, addAuditLog, fetchSharedData]);

    const submitTeacherReport = useCallback(async (reportData: Omit<TeacherReport, 'id' | 'timestamp' | 'status' | 'submittedByUserId'| 'academicYear'>): Promise<TeacherReport> => {
        if (!user) throw new Error("User not authenticated");
        return api.submitTeacherReport(reportData);
    }, [user]);

    const reviewTeacherReport = useCallback(async (reportId: string): Promise<TeacherReport> => {
        if (!user) throw new Error("Unauthorized");
        const reviewedReport = await api.reviewTeacherReport(reportId);
        await addAuditLog('REVIEW_TEACHER_REPORT', { reportId });
        return reviewedReport;
    }, [user, addAuditLog]);

    const updateTeacherReport = useCallback(async (reportId: string, updates: Partial<TeacherReport>): Promise<TeacherReport> => {
        if (!user) throw new Error("Unauthorized");
        const updatedReport = await api.updateTeacherReport(reportId, updates);
        await addAuditLog('UPDATE_TEACHER_REPORT', { reportId, updates });
        return updatedReport;
    }, [user, addAuditLog]);

    const createClass = useCallback(async (classData: Omit<Class, 'id'>): Promise<Class> => {
        if (!user) throw new Error("Unauthorized");
        const newClass = await api.createClass(classData);
        await addAuditLog('CREATE_CLASS', { name: classData.name });
        CacheInvalidation.onClassChange(); // Invalidate cache
        // Refresh classes data to show the new class in the UI
        await fetchSharedData(true);
        return newClass;
    }, [user, addAuditLog, fetchSharedData]);

    const updateClass = useCallback(async (classId: string, updates: Partial<Class>): Promise<Class> => {
        if (!user) throw new Error("Unauthorized");
        const updatedClass = await api.updateClass(classId, updates);
        await addAuditLog('UPDATE_CLASS', { classId, updates });
        CacheInvalidation.onClassChange(); // Invalidate cache
        // Refresh classes data to show the updated class in the UI
        await fetchSharedData(true);
        return updatedClass;
    }, [user, addAuditLog, fetchSharedData]);

    const deleteClass = useCallback(async (classId: string): Promise<void> => {
        if (!user) throw new Error("Unauthorized");
        await api.deleteClass(classId);
        await addAuditLog('DELETE_CLASS', { classId });
        CacheInvalidation.onClassChange(); // Invalidate cache
        // Refresh classes data to remove the deleted class from the UI
        await fetchSharedData(true);
    }, [user, addAuditLog, fetchSharedData]);

    const addBulkAction = useCallback(async (classId: string, action: { type: 'points', points: number, category: string, description: string } | { type: 'badge', presetId: string }) => {
        if (!user) throw new Error("Unauthorized");
        await api.addBulkAction(classId, action);
        await addAuditLog('BULK_ACTION', { classId, action });
    }, [user, addAuditLog]);

    const updatePointLog = useCallback(async (pointLogId: string, updates: Partial<PointLog>): Promise<PointLog> => {
        if (!user) throw new Error("Unauthorized");
        const updatedPointLog = await api.updatePointLog(pointLogId, updates);
        await addAuditLog('UPDATE_POINT_LOG', { pointLogId, updates });
        
        // Invalidate relevant caches using optimized invalidation
        invalidateRelatedData('points', pointLogId);
        
        return updatedPointLog;
    }, [user, addAuditLog]);

    const deletePointLog = useCallback(async (pointLogId: string): Promise<void> => {
        if (!user) throw new Error("Unauthorized");
        await api.deletePointLog(pointLogId);
        await addAuditLog('DELETE_POINT_LOG', { pointLogId });
        
        // Invalidate relevant caches using optimized invalidation
        invalidateRelatedData('points', pointLogId);
    }, [user, addAuditLog]);

    const getPointLog = useCallback(async (pointLogId: string): Promise<PointLog> => {
        if (!user) throw new Error("Unauthorized");
        return api.getPointLog(pointLogId);
    }, [user]);

    const contextValue = useMemo(() => ({
        classes, actionPresets, notifications, users,
        availableYears, selectedYear, isViewingPastYear, loading,
        setSelectedYear,
        addPointLog, updatePointLog, deletePointLog, getPointLog, createQuest, updateQuest, deleteQuest, joinQuest, submitQuestForReview, reviewQuestCompletion,
        submitAppeal, reviewAppeal, withdrawAppeal,
        createUser, updateUser, deleteUser, archiveUser, restoreUser,
        createActionPreset, updateActionPreset, deleteActionPreset,
        submitTeacherReport, reviewTeacherReport, updateTeacherReport,
        createClass, updateClass, deleteClass, addBulkAction,
        markAsRead, addAuditLog,
        refetchSharedData: fetchSharedData,
    }), [
        classes, actionPresets, notifications, users,
        availableYears, selectedYear, isViewingPastYear, loading, setSelectedYear,
        addPointLog, updatePointLog, deletePointLog, getPointLog, createQuest, updateQuest, deleteQuest, joinQuest, submitQuestForReview, reviewQuestCompletion,
        submitAppeal, reviewAppeal, withdrawAppeal,
        createUser, updateUser, deleteUser, archiveUser, restoreUser,
        createActionPreset, updateActionPreset, deleteActionPreset,
        submitTeacherReport, reviewTeacherReport, updateTeacherReport,
        createClass, updateClass, deleteClass, addBulkAction,
        markAsRead, addAuditLog, fetchSharedData
    ]);

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};