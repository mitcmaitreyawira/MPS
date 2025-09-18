import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import * as api from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  switchUser: (role: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to get user profile using existing JWT cookie
        const profile = await api.getProfile();
        console.log('AuthContext: User logged in:', profile?.name, 'Role:', profile?.role);
        setUser(profile);
      } catch (error) {
        // No valid session, user needs to login
        console.log('No valid session found');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (identifier: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const loggedInUser = await api.login(identifier, password);
      setUser(loggedInUser);
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  };

  const switchUser = (role: string): void => {
    // Create demo users for testing
    const demoUsers = {
      admin: {
        id: 'demo-admin',
        firstName: 'Demo',
        lastName: 'Admin',
        email: 'admin@demo.com',
        role: UserRole.ADMIN,
        name: 'Demo Admin'
      },
      teacher: {
        id: 'demo-teacher',
        firstName: 'Demo',
        lastName: 'Teacher',
        email: 'teacher@demo.com',
        role: UserRole.TEACHER,
        name: 'Demo Teacher'
      }
    };

    const demoUser = demoUsers[role as keyof typeof demoUsers];
    if (demoUser) {
      setUser(demoUser);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    switchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};