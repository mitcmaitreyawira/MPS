import { useState, useMemo } from 'react';
import { User } from '../types';
import { useDebounce } from './useDebounce';

interface UseUserSearchOptions {
  debounceMs?: number;
  searchFields?: (keyof User)[];
}

interface UseUserSearchResult {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredUsers: User[];
  isSearching: boolean;
  searchCount: number;
}

/**
 * A unified hook for user search functionality across all dashboard components.
 * Provides consistent debounced search with standardized filtering logic.
 * 
 * @param users - Array of users to search through
 * @param options - Configuration options for search behavior
 * @returns Search state and filtered results
 */
export function useUserSearch(
  users: User[],
  options: UseUserSearchOptions = {}
): UseUserSearchResult {
  const {
    debounceMs = 300,
    searchFields = ['name', 'username', 'firstName', 'lastName', 'email', 'nisn']
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  const filteredUsers = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return users;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return users.filter(user => {
      return searchFields.some(field => {
        const value = user[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower);
        }
        return false;
      });
    });
  }, [users, debouncedSearchTerm, searchFields]);

  const isSearching = searchTerm !== debouncedSearchTerm;
  const searchCount = filteredUsers.length;

  return {
    searchTerm,
    setSearchTerm,
    filteredUsers,
    isSearching,
    searchCount
  };
}

/**
 * Specialized hook for student search with role filtering.
 * Automatically filters users to only include students.
 */
export function useStudentSearch(
  users: User[],
  options: UseUserSearchOptions = {}
): UseUserSearchResult {
  const studentsOnly = useMemo(() => {
    return users.filter(user => {
      // Filter users with student role
      if (Array.isArray(user.roles)) {
        return user.roles.includes('student');
      }
      return false;
    });
  }, [users]);

  return useUserSearch(studentsOnly, options);
}

/**
 * Specialized hook for teacher search with role filtering.
 * Automatically filters users to only include teachers.
 */
export function useTeacherSearch(
  users: User[],
  options: UseUserSearchOptions = {}
): UseUserSearchResult {
  const teachersOnly = useMemo(() => {
    return users.filter(user => {
      // Filter users with teacher or head_teacher role
      if (Array.isArray(user.roles)) {
        return user.roles.some(role => 
          role === 'teacher' || role === 'head_teacher' || role === 'head_of_class'
        );
      }
      return false;
    });
  }, [users]);

  return useUserSearch(teachersOnly, options);
}