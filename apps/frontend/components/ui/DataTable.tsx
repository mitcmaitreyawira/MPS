import React, { useState, useMemo } from 'react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from '../../assets/icons';
import { Input } from './Input';
import { Button } from './Button';
import { Select } from './Select';
import { LoadingSpinner, Skeleton } from './LoadingSpinner';

interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  showPagination?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T, index: number) => void;
  selectedRows?: T[];
  onSelectionChange?: (selectedRows: T[]) => void;
  selectable?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  key: string;
  direction: SortDirection;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  pageSize = 10,
  showPagination = true,
  emptyMessage = 'No data available',
  className = '',
  onRowClick,
  selectedRows = [],
  onSelectionChange,
  selectable = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value ?? '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([key, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(row =>
          String(row[key] ?? '').toLowerCase().includes(String(filterValue).toLowerCase())
        );
      }
    });

    return filtered;
  }, [data, searchTerm, columnFilters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, showPagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        const direction = prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc';
        return { key: direction ? key : '', direction };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleColumnFilter = (key: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (selectedRows.length === paginatedData.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(paginatedData);
    }
  };

  const handleSelectRow = (row: T) => {
    if (!onSelectionChange) return;
    
    const isSelected = selectedRows.some(selected => 
      JSON.stringify(selected) === JSON.stringify(row)
    );
    
    if (isSelected) {
      onSelectionChange(selectedRows.filter(selected => 
        JSON.stringify(selected) !== JSON.stringify(row)
      ));
    } else {
      onSelectionChange([...selectedRows, row]);
    }
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ChevronDownIcon className="h-4 w-4 text-gray-400" />;
    }
    return (
      <ChevronDownIcon 
        className={`h-4 w-4 transition-transform ${
          sortConfig.direction === 'desc' ? 'rotate-180' : ''
        } ${
          sortConfig.direction ? 'text-primary' : 'text-gray-400'
        }`} 
      />
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        {searchable && (
          <div className="p-4 border-b border-gray-200">
            <Skeleton variant="rectangular" height={40} className="max-w-sm" />
          </div>
        )}
        <div className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={48} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Search and Filters */}
      {searchable && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            {Object.keys(columnFilters).length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setColumnFilters({});
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 text-sm font-medium text-gray-700 ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.key as string)}
                        className="hover:bg-gray-100 p-1 rounded"
                      >
                        {getSortIcon(column.key as string)}
                      </button>
                    )}
                  </div>
                  {column.filterable && (
                    <div className="mt-2">
                      <Input
                        type="text"
                        placeholder={`Filter ${column.header.toLowerCase()}...`}
                        value={columnFilters[column.key as string] || ''}
                        onChange={(e) => handleColumnFilter(column.key as string, e.target.value)}
                        size="sm"
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0)} 
                  className="px-4 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const isSelected = selectedRows.some(selected => 
                  JSON.stringify(selected) === JSON.stringify(row)
                );
                
                return (
                  <tr
                    key={rowIndex}
                    className={`hover:bg-gray-50 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => onRowClick?.(row, rowIndex)}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(row)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                    )}
                    {columns.map((column, colIndex) => {
                      const value = row[column.key as keyof T];
                      return (
                        <td
                          key={colIndex}
                          className={`px-4 py-3 text-sm text-gray-900 ${
                            column.align === 'center' ? 'text-center' : 
                            column.align === 'right' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {column.render ? column.render(value, row, rowIndex) : String(value || '')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;