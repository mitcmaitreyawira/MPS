import { useState, useEffect, useMemo, useCallback } from 'react';

interface UseVirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualizationResult {
  startIndex: number;
  endIndex: number;
  visibleItems: any[];
  totalHeight: number;
  offsetY: number;
  scrollToIndex: (index: number) => void;
}

/**
 * Custom hook for virtualizing large lists to improve performance
 * Only renders visible items plus a small buffer (overscan)
 */
export function useVirtualization<T>(
  items: T[],
  options: UseVirtualizationOptions
): VirtualizationResult {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);

  // Calculate visible range
  const { startIndex, endIndex, visibleItems, totalHeight, offsetY } = useMemo(() => {
    const itemCount = items.length;
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(itemCount - 1, start + visibleCount + overscan * 2);
    
    const visible = items.slice(start, end + 1);
    const total = itemCount * itemHeight;
    const offset = start * itemHeight;
    
    return {
      startIndex: start,
      endIndex: end,
      visibleItems: visible,
      totalHeight: total,
      offsetY: offset
    };
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);

  // Handle scroll events
  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    setScrollTop(target.scrollTop);
  }, []);

  // Attach scroll listener
  useEffect(() => {
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        scrollElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [scrollElement, handleScroll]);

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number) => {
    if (scrollElement) {
      const targetScrollTop = index * itemHeight;
      scrollElement.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }
  }, [scrollElement, itemHeight]);

  // Return scroll element setter for the component to use
  const result: VirtualizationResult & { setScrollElement: (element: HTMLElement | null) => void } = {
    startIndex,
    endIndex,
    visibleItems,
    totalHeight,
    offsetY,
    scrollToIndex,
    setScrollElement
  };

  return result as VirtualizationResult;
}

/**
 * Hook for paginated data loading with infinite scroll
 */
interface UsePaginatedDataOptions<T> {
  pageSize: number;
  loadMore: (page: number) => Promise<T[]>;
  hasMore: boolean;
}

interface PaginatedDataResult<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  loadNextPage: () => void;
  reset: () => void;
}

export function usePaginatedData<T>(
  options: UsePaginatedDataOptions<T>
): PaginatedDataResult<T> {
  const { pageSize, loadMore, hasMore } = options;
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const loadNextPage = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const newItems = await loadMore(currentPage + 1);
      setItems(prev => [...prev, ...newItems]);
      setCurrentPage(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, loadMore, currentPage]);

  const reset = useCallback(() => {
    setItems([]);
    setCurrentPage(0);
    setError(null);
    setLoading(false);
  }, []);

  return {
    items,
    loading,
    error,
    loadNextPage,
    reset
  };
}