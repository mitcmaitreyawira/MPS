import React from 'react';
import { MagnifyingGlassIcon } from '../assets/icons';
import { Input } from './ui/Input';

export interface SearchFilters {
  search: string;
  role: string;
  classId: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  includeArchived: boolean;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  placeholder?: string;
  className?: string;
}

export const AdvancedSearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  placeholder = 'Search by name, email, NISN, or username...',
  className = '',
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Simple Search Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default AdvancedSearchFilters;