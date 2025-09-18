import { useState, useCallback } from 'react';
import { useUserSearch } from './useUserSearch';
import { User } from '../types';

interface SearchError {
  message: string;
  code?: string;
  timestamp: Date;
}

interface UseSearchWithErrorHandlingResult {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredUsers: User[];
  isSearching: boolean;
  searchCount: number;
  isLoading: boolean;
  error: SearchError | null;
  retrySearch: () => void;
  clearError: () => void;
}

interface UseSearchWithErrorHandlingOptions {
  debounceMs?: number;
  searchFields?: (keyof User)[];
  onError?: (error: SearchError) => void;
  maxRetries?: number;
}

/**
 * Enhanced search hook with error handling and loading states.
 * Provides robust search functionality with proper error recovery.
 */
export function useSearchWithErrorHandling(
  users: User[],
  options: UseSearchWithErrorHandlingOptions = {}
): UseSearchWithErrorHandlingResult {
  const {
    debounceMs = 300,
    searchFields,
    onError,
    maxRetries = 3
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<SearchError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const searchResult = useUserSearch(users, { debounceMs, searchFields });

  const handleError = useCallback((errorMessage: string, code?: string) => {
    const searchError: SearchError = {
      message: errorMessage,
      code,
      timestamp: new Date()
    };
    
    setError(searchError);
    setIsLoading(false);
    
    if (onError) {
      onError(searchError);
    }
  }, [onError]);

  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  const retrySearch = useCallback(() => {
    if (retryCount >= maxRetries) {
      handleError(
        `Search failed after ${maxRetries} attempts. Please try again later.`,
        'MAX_RETRIES_EXCEEDED'
      );
      return;
    }

    setError(null);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);

    // Simulate search retry with timeout
    setTimeout(() => {
      try {
        // In a real implementation, this would re-trigger the search
        setIsLoading(false);
      } catch (err) {
        handleError(
          err instanceof Error ? err.message : 'Unknown search error',
          'SEARCH_RETRY_FAILED'
        );
      }
    }, 1000);
  }, [retryCount, maxRetries, handleError]);

  // Enhanced setSearchTerm with error handling
  const setSearchTermWithErrorHandling = useCallback((term: string) => {
    try {
      clearError();
      setIsLoading(true);
      
      // Validate search term
      if (term.length > 100) {
        handleError('Search term is too long. Please use fewer than 100 characters.', 'TERM_TOO_LONG');
        return;
      }

      // Check for potentially problematic characters
      const invalidChars = /[<>"'&]/;
      if (invalidChars.test(term)) {
        handleError('Search term contains invalid characters.', 'INVALID_CHARACTERS');
        return;
      }

      searchResult.setSearchTerm(term);
      
      // Simulate loading delay for debounced search
      setTimeout(() => {
        setIsLoading(false);
      }, debounceMs + 50);
      
    } catch (err) {
      handleError(
        err instanceof Error ? err.message : 'Failed to update search term',
        'SEARCH_UPDATE_FAILED'
      );
    }
  }, [searchResult.setSearchTerm, debounceMs, handleError, clearError]);

  return {
    searchTerm: searchResult.searchTerm,
    setSearchTerm: setSearchTermWithErrorHandling,
    filteredUsers: searchResult.filteredUsers,
    isSearching: searchResult.isSearching,
    searchCount: searchResult.searchCount,
    isLoading: isLoading || searchResult.isSearching,
    error,
    retrySearch,
    clearError
  };
}

/**
 * Hook for displaying search error messages in a user-friendly format.
 */
export function useSearchErrorMessages() {
  const getErrorMessage = useCallback((error: SearchError | null): string => {
    if (!error) return '';

    switch (error.code) {
      case 'TERM_TOO_LONG':
        return 'Search term is too long. Please use fewer characters.';
      case 'INVALID_CHARACTERS':
        return 'Please remove special characters from your search.';
      case 'MAX_RETRIES_EXCEEDED':
        return 'Search is temporarily unavailable. Please try again later.';
      case 'SEARCH_RETRY_FAILED':
        return 'Unable to retry search. Please refresh the page.';
      case 'SEARCH_UPDATE_FAILED':
        return 'Failed to update search. Please try again.';
      default:
        return error.message || 'An unexpected error occurred while searching.';
    }
  }, []);

  const getErrorSeverity = useCallback((error: SearchError | null): 'info' | 'warning' | 'error' => {
    if (!error) return 'info';

    switch (error.code) {
      case 'TERM_TOO_LONG':
      case 'INVALID_CHARACTERS':
        return 'warning';
      case 'MAX_RETRIES_EXCEEDED':
      case 'SEARCH_RETRY_FAILED':
        return 'error';
      default:
        return 'warning';
    }
  }, []);

  return {
    getErrorMessage,
    getErrorSeverity
  };
}