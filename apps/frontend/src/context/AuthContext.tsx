import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (userType: 'admin' | 'teacher') => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Mock users for testing
const mockUsers = {
  admin: {
    id: 'admin-1',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  teacher: {
    id: 'teacher-1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: UserRole.TEACHER,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        // Check if we have cookies by trying to get profile
        const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';
    const response = await fetch(`${API_URL}/auth/profile`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const apiUser = data.user;
          
          // Transform API user to frontend User type
          const user: User = {
            id: apiUser._id || apiUser.id,
            firstName: apiUser.firstName,
            lastName: apiUser.lastName,
            role: apiUser.roles?.[0] === 'admin' ? UserRole.ADMIN : 
                  apiUser.roles?.[0] === 'teacher' ? UserRole.TEACHER : UserRole.STUDENT,
            isArchived: apiUser.isArchived || false,
            createdAt: new Date(apiUser.createdAt),
            updatedAt: new Date(apiUser.updatedAt)
          };
          
          setUser(user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // No valid session
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      setLoading(true);
      
      // Get CSRF token first
      const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';
      await fetch(`${API_URL}/health`, { credentials: 'include' });
      
      // Get CSRF token from cookie
      const csrfToken = document.cookie.split('; ').find(r => r.startsWith('csrf_token='))?.split('=')[1];
      
      // Real API login
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken && { 'X-CSRF-Token': csrfToken })
        },
        credentials: 'include',
        body: JSON.stringify({
          nisn: identifier, // Use NISN for login
          password: password
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      const apiUser = data.user;
      
      // Transform API user to frontend User type
      const user: User = {
        id: apiUser._id || apiUser.id,
        firstName: apiUser.firstName,
        lastName: apiUser.lastName,
        role: apiUser.roles?.[0] === 'admin' ? UserRole.ADMIN : 
              apiUser.roles?.[0] === 'teacher' ? UserRole.TEACHER : UserRole.STUDENT,
        isArchived: apiUser.isArchived || false,
        createdAt: new Date(apiUser.createdAt),
        updatedAt: new Date(apiUser.updatedAt)
      };
      
      setUser(user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const switchUser = (userType: 'admin' | 'teacher') => {
    const selectedUser = mockUsers[userType];
    setUser(selectedUser);
    localStorage.setItem('user', JSON.stringify(selectedUser));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    switchUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};