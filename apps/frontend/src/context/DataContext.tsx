import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Quest, QuestParticipant, User, Class, DataContextType, UserRole, QuestParticipantStatus, ActionPreset, ActionType, BadgeTier } from '../types';
import { useAuth } from './AuthContext';

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

// Mock data for development
const mockQuests: Quest[] = [
  {
    id: '1',
    title: 'Complete Math Assignment',
    description: 'Finish the algebra homework from chapter 5',
    points: 10,
    isActive: true,
    supervisorId: 'teacher-1', // Assigned to Sarah Johnson
    createdBy: 'admin-1',
    academicYear: '2024-2025',
    createdAt: new Date()
  },
  {
    id: '2',
    title: 'Science Lab Report',
    description: 'Write a detailed report on the chemistry experiment',
    points: 15,
    isActive: true,
    supervisorId: 'teacher-1', // Assigned to Sarah Johnson
    createdBy: 'admin-1',
    academicYear: '2024-2025',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    createdAt: new Date()
  },
  {
    id: '3',
    title: 'Read Chapter 10',
    description: 'Read and summarize chapter 10 of the history textbook',
    points: 8,
    isActive: false,
    supervisorId: 'teacher-1', // Assigned to Sarah Johnson
    createdBy: 'admin-1',
    academicYear: '2024-2025',
    createdAt: new Date()
  },
  {
    id: '4',
    title: 'Art Project Submission',
    description: 'Create and submit your final art project for the semester',
    points: 20,
    isActive: true,
    supervisorId: 'admin-1', // Supervised by admin for demo
    createdBy: 'admin-1',
    academicYear: '2024-2025',
    createdAt: new Date()
  }
];

// Mock users data - Updated to match database teachers
const mockUsers: User[] = [
  {
    id: 'admin-1',
    firstName: 'Admin',
    lastName: 'User',
    name: 'Admin User',
    role: UserRole.ADMIN,
    roles: ['admin'],
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Real teachers from database
  {
    id: 'teacher-1',
    firstName: 'John',
    lastName: 'Teacher',
    name: 'John Teacher',
    role: UserRole.TEACHER,
    roles: ['teacher'],
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'teacher-2',
    firstName: 'Jane',
    lastName: 'Educator',
    name: 'Jane Educator',
    role: UserRole.TEACHER,
    roles: ['teacher'],
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'teacher-3',
    firstName: 'Mike',
    lastName: 'Instructor',
    name: 'Mike Instructor',
    role: UserRole.TEACHER,
    roles: ['teacher'],
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'student-1',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    role: UserRole.STUDENT,
    roles: ['student'],
    classId: 'class-1',
    className: 'Grade 10 - Section A',
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'student-2',
    firstName: 'Jane',
    lastName: 'Smith',
    name: 'Jane Smith',
    role: UserRole.STUDENT,
    roles: ['student'],
    classId: 'class-2',
    className: 'Grade 10 - Section B',
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'student-3',
    firstName: 'Mike',
    lastName: 'Wilson',
    name: 'Mike Wilson',
    role: UserRole.STUDENT,
    roles: ['student'],
    classId: 'class-3',
    className: 'Grade 11 - Section A',
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock quest participants data
const mockQuestParticipants: QuestParticipant[] = [
  {
    id: 'qp-1',
    questId: '1',
    userId: 'student-1',
    status: QuestParticipantStatus.COMPLETED,
    joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    studentNotes: 'Completed all algebra problems successfully'
  },
  {
    id: 'qp-2',
    questId: '1',
    userId: 'student-2',
    status: QuestParticipantStatus.IN_PROGRESS,
    joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    id: 'qp-3',
    questId: '2',
    userId: 'student-1',
    status: QuestParticipantStatus.COMPLETED,
    joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    completedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    studentNotes: 'Lab report submitted with detailed analysis and conclusions'
  },
  {
    id: 'qp-4',
    questId: '2',
    userId: 'student-3',
    status: QuestParticipantStatus.IN_PROGRESS,
    joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    id: 'qp-5',
    questId: '3',
    userId: 'student-2',
    status: QuestParticipantStatus.COMPLETED,
    joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    studentNotes: 'Read chapter 10 and created summary notes'
  }
];

// Mock classes data
const mockClasses: Class[] = [
  {
    id: 'class-1',
    name: 'Grade 10 - Section A',
    headTeacherId: 'teacher-1'
  },
  {
    id: 'class-2',
    name: 'Grade 10 - Section B',
    headTeacherId: 'teacher-2'
  },
  {
    id: 'class-3',
    name: 'Grade 11 - Section A',
    headTeacherId: 'teacher-3'
  },
  {
    id: 'class-4',
    name: 'Grade 11 - Section B'
  },
  {
    id: 'class-5',
    name: 'Grade 12 - Section A'
  }
];

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [quests, setQuests] = useState<Quest[]>(mockQuests);
  const [questParticipants, setQuestParticipants] = useState<QuestParticipant[]>(mockQuestParticipants);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [classes, setClasses] = useState<Class[]>(mockClasses);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null)

  // API base URL
  const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

  // Helper function to make API calls
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    // Get CSRF token from cookie if needed for state-changing requests
    const method = (options.method || 'GET').toUpperCase();
    let csrfToken = document.cookie.split('; ').find(r => r.startsWith('csrf_token='))?.split('=')[1];
    
    // If this is a state-changing request and we don't have a csrf cookie yet,
    // make a benign GET to prime the cookie
    if (!csrfToken && ['POST','PUT','PATCH','DELETE'].includes(method)) {
      try {
        await fetch(`${API_BASE}/health`, { credentials: 'include' });
      } catch { /* ignore any errors; goal is just to set csrf cookie */ }
      csrfToken = document.cookie.split('; ').find(r => r.startsWith('csrf_token='))?.split('=')[1];
    }
    
    const headers = {
      'Content-Type': 'application/json',
      ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      ...options.headers,
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  };

  // State for action presets
  const [actionPresets, setActionPresets] = useState<ActionPreset[]>([]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [questsData, participantsData, usersData, classesData, actionPresetsData] = await Promise.allSettled([
        apiCall('/quests'),
        apiCall('/quest-participants'),
        apiCall('/users'),
        apiCall('/classes'),
        apiCall('/action-presets?limit=100')
      ]);

      // Handle quests data
      if (questsData.status === 'fulfilled') {
        setQuests(questsData.value.data || questsData.value || []);
      } else {
        console.log('Quests API failed, using mock data:', questsData.reason?.message);
        setQuests(mockQuests);
      }
      
      // Handle participants data
      if (participantsData.status === 'fulfilled') {
        setQuestParticipants(participantsData.value.data || participantsData.value || []);
      } else {
        console.log('Quest participants API failed, using mock data:', participantsData.reason?.message);
        setQuestParticipants(mockQuestParticipants);
      }
      
      // Handle users data
      if (usersData.status === 'fulfilled') {
        const apiUsers = usersData.value.users || usersData.value.data || usersData.value || [];
        if (apiUsers.length > 0) {
          // Transform API users to frontend User type
          const transformedUsers = apiUsers.map((apiUser: any) => {
            console.log('Processing API user:', {
              name: apiUser.name,
              firstName: apiUser.firstName,
              lastName: apiUser.lastName,
              classId: apiUser.classId,
              roles: apiUser.roles
            });
            return {
              id: apiUser._id || apiUser.id,
              firstName: apiUser.firstName,
              lastName: apiUser.lastName,
              name: apiUser.name || `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim() || apiUser.nisn || 'Unknown User',
              roles: apiUser.roles || [],
              role: apiUser.roles?.[0] === 'admin' ? UserRole.ADMIN : 
                    apiUser.roles?.[0] === 'teacher' ? UserRole.TEACHER : 
                    apiUser.roles?.[0] === 'head_teacher' ? UserRole.TEACHER :
                    apiUser.roles?.[0] === 'head_of_class' ? UserRole.HEAD_OF_CLASS :
                    UserRole.STUDENT,
              nisn: apiUser.nisn,
              classId: apiUser.classId?._id || apiUser.classId,
              className: apiUser.classId?.name || '',
              subject: apiUser.subject,
              contactNumber: apiUser.contactNumber,
              childIds: apiUser.childIds,
              isArchived: apiUser.isArchived || false,
              points: apiUser.points || 0,
              createdAt: new Date(apiUser.createdAt),
              updatedAt: new Date(apiUser.updatedAt)
            };
          });
          setUsers(transformedUsers);
          console.log('Users loaded from API:', transformedUsers.length, 'users');
          console.log('Sample transformed user with class info:', transformedUsers.find(u => u.roles?.includes('student')));
        } else {
          console.log('API returned empty users array, using mock data');
          setUsers(mockUsers);
        }
      } else {
        console.log('Users API failed, using mock data:', usersData.reason?.message);
        setUsers(mockUsers);
      }

      // Handle classes data
      if (classesData.status === 'fulfilled') {
        const classes = classesData.value?.data;
        if (classes && Array.isArray(classes) && classes.length > 0) {
          console.log('Successfully loaded classes from API:', classes.length);
          setClasses(classes);
        } else {
          console.log('API returned empty classes array, using mock data');
          setClasses(mockClasses);
        }
      } else {
        console.log('Classes API failed, using mock data:', classesData.reason?.message);
        setClasses(mockClasses);
      }
      
      // Handle action presets data
      if (actionPresetsData.status === 'fulfilled') {
        const presets = actionPresetsData.value?.data?.data || actionPresetsData.value?.data || actionPresetsData.value || [];
        if (presets && Array.isArray(presets) && presets.length > 0) {
          console.log('Successfully loaded action presets from API:', presets.length);
          setActionPresets(presets);
        } else {
          console.log('API returned empty action presets array, using mock data');
          setActionPresets(mockActionPresets);
        }
      } else {
        console.log('Action presets API failed, using mock data:', actionPresetsData.reason?.message);
        setActionPresets(mockActionPresets);
      }

    } catch (err) {
      console.log('Unexpected error during data refresh, falling back to mock data:', (err as Error).message);
      setError((err as Error).message);
      // Fallback to mock data when API fails
      setUsers(mockUsers);
      setQuests(mockQuests);
      setQuestParticipants(mockQuestParticipants);
      setClasses(mockClasses);
      setActionPresets(mockActionPresets);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh data when user logs in or on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated, loading data...');
      refreshData();
    } else {
      console.log('User not authenticated, using mock data');
      // Set mock data when not authenticated
      setUsers(mockUsers);
      setQuests(mockQuests);
      setQuestParticipants(mockQuestParticipants);
      setClasses(mockClasses);
      setActionPresets(mockActionPresets);
      setLoading(false);
    }
  }, [isAuthenticated, user]); // Removed refreshData from dependencies to prevent infinite loops

  // Quest management functions
  const createQuest = async (questData: Omit<Quest, 'id' | 'createdAt' | 'createdBy' | 'academicYear'>): Promise<Quest> => {
    try {
      const response = await apiCall('/quests', {
        method: 'POST',
        body: JSON.stringify(questData),
      });
      
      const newQuest = response.data || response;
      setQuests(prev => [...prev, newQuest]);
      return newQuest;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  const updateQuest = async (id: string, updates: Partial<Quest>): Promise<Quest> => {
    try {
      const response = await apiCall(`/quests/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      const updatedQuest = response.data || response;
      setQuests(prev => prev.map(q => q.id === id ? updatedQuest : q));
      return updatedQuest;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  const deleteQuest = async (id: string): Promise<void> => {
    try {
      await apiCall(`/quests/${id}`, {
        method: 'DELETE',
      });
      
      setQuests(prev => prev.filter(q => q.id !== id));
      setQuestParticipants(prev => prev.filter(p => p.questId !== id));
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  // Quest participation functions
  const joinQuest = async (questId: string): Promise<QuestParticipant> => {
    try {
      const response = await apiCall(`/quests/${questId}/join`, {
        method: 'POST',
      });
      
      const participation = response.data || response;
      setQuestParticipants(prev => [...prev, participation]);
      return participation;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  const leaveQuest = async (questId: string): Promise<void> => {
    try {
      await apiCall(`/quests/${questId}/leave`, {
        method: 'POST',
      });
      
      setQuestParticipants(prev => prev.filter(p => p.questId !== questId));
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  const completeQuest = async (questId: string, notes?: string): Promise<void> => {
    try {
      await apiCall(`/quests/${questId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      });
      
      setQuestParticipants(prev => 
        prev.map(p => 
          p.questId === questId 
            ? { ...p, status: 'completed' as any, completedAt: new Date() }
            : p
        )
      );
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  };

  // Class management functions
  const createClass = useCallback(async (classData: Omit<Class, 'id'>): Promise<Class> => {
    try {
      const response = await apiCall('/classes', {
        method: 'POST',
        body: JSON.stringify(classData),
      });
      
      const newClass = response.data || response;
      setClasses(prev => [...prev, newClass]);
      return newClass;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  const updateClass = useCallback(async (classId: string, updates: Partial<Class>): Promise<Class> => {
    try {
      const response = await apiCall(`/classes/${classId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      const updatedClass = response.data || response;
      setClasses(prev => prev.map(c => c.id === classId ? updatedClass : c));
      return updatedClass;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  const deleteClass = useCallback(async (classId: string): Promise<void> => {
    try {
      await apiCall(`/classes/${classId}`, {
        method: 'DELETE',
      });
      
      setClasses(prev => prev.filter(c => c.id !== classId));
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Mock implementations for missing required properties
  const mockActionPresets: ActionPreset[] = [
    {
      id: 'preset-1',
      type: ActionType.REWARD,
      name: 'Excellent Participation',
      category: 'Academic Excellence',
      description: 'Awarded for outstanding participation in class discussions',
      points: 10,
      isArchived: false,
      createdBy: 'admin-1'
    },
    {
      id: 'preset-2',
      type: ActionType.REWARD,
      name: 'Homework Completion',
      category: 'Academic Excellence',
      description: 'Completed homework on time with high quality',
      points: 5,
      isArchived: false,
      createdBy: 'admin-1'
    },
    {
      id: 'preset-3',
      type: ActionType.VIOLATION,
      name: 'Late Submission',
      category: 'Academic Discipline',
      description: 'Assignment submitted after the deadline',
      points: -3,
      isArchived: false,
      createdBy: 'admin-1'
    },
    {
      id: 'preset-4',
      type: ActionType.MEDAL,
      name: 'Academic Achievement',
      category: 'Special Recognition',
      description: 'Outstanding academic performance this semester',
      points: 25,
      badgeTier: BadgeTier.GOLD,
      icon: 'star',
      isArchived: false,
      createdBy: 'admin-1'
    },
    {
      id: 'preset-5',
      type: ActionType.REWARD,
      name: 'Helping Classmates',
      category: 'Social Behavior',
      description: 'Demonstrated excellent teamwork and helped fellow students',
      points: 8,
      isArchived: false,
      createdBy: 'teacher-1'
    }
  ];
  // Action presets are now managed by state above
  const notifications: any[] = [];
  
  const createActionPreset = useCallback(async (preset: any) => {
    console.log('createActionPreset not implemented in this context');
    return preset;
  }, []);
  
  const updateActionPreset = useCallback(async (presetId: string, updates: any) => {
    console.log('updateActionPreset not implemented in this context');
    return updates;
  }, []);
  
  const deleteActionPreset = useCallback(async (presetId: string) => {
    console.log('deleteActionPreset not implemented in this context');
  }, []);
  
  const markNotificationsAsRead = useCallback(async (ids: string[]) => {
    console.log('markNotificationsAsRead not implemented in this context');
  }, []);
  
  const addBulkAction = useCallback(async (classId: string, action: any) => {
    console.log('addBulkAction not implemented in this context');
  }, []);

  const value: DataContextType = {
    quests,
    questParticipants,
    users,
    classes,
    actionPresets,
    notifications,

    loading,
    error,
    createQuest,
    updateQuest,
    deleteQuest,
    joinQuest,
    leaveQuest,
    completeQuest,
    createClass,
    updateClass,
    deleteClass,
    createActionPreset,
    updateActionPreset,
    deleteActionPreset,
    markNotificationsAsRead,
    addBulkAction,
    refreshData,
  };

  return (
    <DataContext.Provider value={value}>
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