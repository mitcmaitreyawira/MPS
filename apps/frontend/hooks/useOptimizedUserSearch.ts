import { useMemo, useCallback } from 'react';
import { User } from '../types';
import { useDebounce } from './useDebounce';

export interface SearchFilters {
  search: string;
  role: string;
  classId: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  includeArchived: boolean;
}

interface UseOptimizedUserSearchOptions {
  debounceMs?: number;
  maxResults?: number;
  enableVirtualization?: boolean;
}

interface UseOptimizedUserSearchResult {
  filteredUsers: User[];
  totalCount: number;
  isFiltering: boolean;
  searchStats: {
    totalUsers: number;
    filteredCount: number;
    searchTerm: string;
    activeFilters: number;
  };
}

/**
 * Optimized user search hook for handling large datasets efficiently
 * Features:
 * - Debounced search to reduce API calls
 * - Memoized filtering for performance
 * - Search result limiting
 * - Search statistics
 * - Memory-efficient filtering
 */
export function useOptimizedUserSearch(
  users: User[],
  filters: SearchFilters,
  options: UseOptimizedUserSearchOptions = {}
): UseOptimizedUserSearchResult {
  const {
    debounceMs = 300,
    maxResults = 1000,
    enableVirtualization = true
  } = options;

  const debouncedSearchTerm = useDebounce(filters.search, debounceMs);
  const debouncedFilters = useDebounce(filters, debounceMs);

  // Memoized search function for better performance
  const searchFunction = useCallback((user: User, searchTerm: string): boolean => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const searchFields = [
      user.firstName,
      user.lastName,
      user.nisn,
      user.name,
      `${user.firstName} ${user.lastName}`.trim()
    ].filter(Boolean);

    return searchFields.some(field => 
      field?.toLowerCase().includes(searchLower)
    );
  }, []);

  // Memoized role filter
  const roleFilter = useCallback((user: User, roleFilter: string): boolean => {
    if (!roleFilter || roleFilter === 'all') return true;
    
    // Check roles array first (new format)
    if (Array.isArray(user.roles)) {
      return user.roles.includes(roleFilter);
    }
    
    // Fallback to single role property (backward compatibility)
    if (user.role) {
      return user.role === roleFilter;
    }
    
    return false;
  }, []);

  // Memoized class filter
  const classFilter = useCallback((user: User, classId: string): boolean => {
    if (!classId) return true;
    return user.classId === classId;
  }, []);

  // Memoized archived filter
  const archivedFilter = useCallback((user: User, includeArchived: boolean): boolean => {
    if (includeArchived) return true;
    return !user.isArchived;
  }, []);



  // Memoized sorting function
  const sortFunction = useCallback((a: User, b: User, sortBy: string, sortOrder: 'asc' | 'desc'): number => {
    let aValue: string | number | Date;
    let bValue: string | number | Date;

    switch (sortBy) {
      case 'firstName':
        aValue = a.firstName || '';
        bValue = b.firstName || '';
        break;
      case 'lastName':
        aValue = a.lastName || '';
        bValue = b.lastName || '';
        break;
      case 'email':
        aValue = a.nisn || ''; // Using NISN as email equivalent
        bValue = b.nisn || '';
        break;
      case 'username':
        aValue = a.name || '';
        bValue = b.name || '';
        break;
      case 'nisn':
        aValue = a.nisn || '';
        bValue = b.nisn || '';
        break;
      case 'points':
        aValue = a.points || 0;
        bValue = b.points || 0;
        break;
      case 'createdAt':
      default:
        // For now, sort by name as fallback since createdAt/lastLoginAt aren't in frontend User type
        aValue = `${a.firstName || ''} ${a.lastName || ''}`.trim();
        bValue = `${b.firstName || ''} ${b.lastName || ''}`.trim();
        break;
    }

    let comparison = 0;
      if (typeof aValue === 'object' && typeof bValue === 'object' && 
          aValue && bValue && 'getTime' in aValue && 'getTime' in bValue) {
        comparison = (aValue as Date).getTime() - (bValue as Date).getTime();
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortOrder === 'asc' ? comparison : -comparison;
  }, []);

  // Main filtering and sorting logic with memoization
  const { filteredUsers, totalCount, searchStats } = useMemo(() => {
    const startTime = performance.now();
    
    // Early return for empty dataset
    if (!users || users.length === 0) {
      return {
        filteredUsers: [],
        totalCount: 0,
        searchStats: {
          totalUsers: 0,
          filteredCount: 0,
          searchTerm: debouncedSearchTerm,
          activeFilters: 0
        }
      };
    }

    // Count active filters
    const activeFilters = [
      debouncedFilters.search,
      debouncedFilters.role && debouncedFilters.role !== 'all',
      debouncedFilters.classId,
      !debouncedFilters.includeArchived,

      debouncedFilters.sortBy !== 'firstName' || debouncedFilters.sortOrder !== 'asc'
    ].filter(Boolean).length;

    // Apply filters efficiently
    let filtered = users;
    
    // Apply filters in order of selectivity (most selective first)
    if (debouncedFilters.classId) {
      filtered = filtered.filter(user => classFilter(user, debouncedFilters.classId));
    }
    
    if (debouncedFilters.role && debouncedFilters.role !== 'all') {
      filtered = filtered.filter(user => roleFilter(user, debouncedFilters.role));
    }
    
    if (!debouncedFilters.includeArchived) {
      filtered = filtered.filter(user => archivedFilter(user, debouncedFilters.includeArchived));
    }
    
    if (debouncedSearchTerm) {
      filtered = filtered.filter(user => searchFunction(user, debouncedSearchTerm));
    }
    


    // Sort the filtered results
    if (filtered.length > 1) {
      filtered.sort((a, b) => sortFunction(a, b, debouncedFilters.sortBy, debouncedFilters.sortOrder));
    }

    // Limit results for performance if virtualization is disabled
    const limitedResults = enableVirtualization ? filtered : filtered.slice(0, maxResults);
    
    const endTime = performance.now();
    console.log(`User search completed in ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`Filtered ${users.length} users down to ${filtered.length} results`);

    return {
      filteredUsers: limitedResults,
      totalCount: filtered.length,
      searchStats: {
        totalUsers: users.length,
        filteredCount: filtered.length,
        searchTerm: debouncedSearchTerm,
        activeFilters
      }
    };
  }, [users, debouncedFilters, debouncedSearchTerm, searchFunction, roleFilter, classFilter, archivedFilter, sortFunction, maxResults, enableVirtualization]);

  // Determine if currently filtering (debounce in progress)
  const isFiltering = useMemo(() => {
    return filters.search !== debouncedSearchTerm ||
           JSON.stringify(filters) !== JSON.stringify(debouncedFilters);
  }, [filters, debouncedSearchTerm, debouncedFilters]);

  return {
    filteredUsers,
    totalCount,
    isFiltering,
    searchStats
  };
}

/**
 * Hook for optimized student search with role pre-filtering
 */
export function useOptimizedStudentSearch(
  users: User[],
  filters: Omit<SearchFilters, 'role'>,
  options: UseOptimizedUserSearchOptions = {}
) {
  const studentsOnly = useMemo(() => {
    return users.filter(user => {
      // Check roles array first (new format)
      if (Array.isArray(user.roles)) {
        return user.roles.includes('student');
      }
      // Fallback to single role property (backward compatibility)
      if (user.role) {
        return user.role === 'student';
      }
      return false;
    });
  }, [users]);

  return useOptimizedUserSearch(studentsOnly, { ...filters, role: 'student' }, options);
}

/**
 * Hook for optimized teacher search with role pre-filtering
 */
export function useOptimizedTeacherSearch(
  users: User[],
  filters: Omit<SearchFilters, 'role'>,
  options: UseOptimizedUserSearchOptions = {}
) {
  const teachersOnly = useMemo(() => {
    return users.filter(user => {
      // Check roles array first (new format)
      if (Array.isArray(user.roles)) {
        return user.roles.some(role => 
          ['teacher', 'head_teacher', 'head_of_class'].includes(role)
        );
      }
      // Fallback to single role property (backward compatibility)
      if (user.role) {
        return ['teacher', 'head_teacher', 'head_of_class'].includes(user.role);
      }
      return false;
    });
  }, [users]);

  return useOptimizedUserSearch(teachersOnly, { ...filters, role: 'teacher' }, options);
}