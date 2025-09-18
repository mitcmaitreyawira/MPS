
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { User } from '../../types';
import { Input } from '../../components/ui/Input';
import { MagnifyingGlassIcon, ChevronDownIcon, XCircleIcon } from '../../assets/icons';
import { getAvatarColor, getInitials } from '../../utils/helpers';
import { useDebounce } from '../../hooks/useDebounce';
import { getUsers } from '../../services/api';

interface SearchableSingleUserSelectorProps {
    users?: User[]; // Made optional for backward compatibility
    selectedUserId: string;
    onSelectUser: (id: string) => void;
    placeholder?: string;
    required?: boolean;
    useDatabase?: boolean; // New prop to enable database search
    roleFilter?: string; // Optional role filter for database search
    classFilter?: string; // Optional class filter for database search
}

const SearchableSingleUserSelector: React.FC<SearchableSingleUserSelectorProps> = React.memo(({
    users = [],
    selectedUserId,
    onSelectUser,
    placeholder = 'Search and select a user...',
    required = false,
    useDatabase = false,
    roleFilter,
    classFilter
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    
    // Find selected user from either users prop or search results
    useEffect(() => {
        if (selectedUserId) {
            const user = users.find(u => u.id === selectedUserId) || 
                        searchResults.find(u => u.id === selectedUserId);
            if (user) {
                setSelectedUser(user);
            } else if (useDatabase && selectedUserId) {
                // If using database and we don't have the selected user, fetch it
                fetchUserById(selectedUserId);
            }
        } else {
            setSelectedUser(null);
        }
    }, [selectedUserId, users, searchResults, useDatabase]);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    // Fetch user by ID for selected user display
    const fetchUserById = useCallback(async (userId: string) => {
        try {
            const response = await getUsers({ 
                search: '',
                limit: 1,
                page: 1,
                ...(roleFilter && { role: roleFilter }),
                ...(classFilter && { classId: classFilter })
            });
            const user = response.users.find(u => u.id === userId);
            if (user) {
                setSelectedUser(user);
            }
        } catch (error) {
            console.error('Error fetching user by ID:', error);
        }
    }, [roleFilter, classFilter]);

    // Database search function
    const searchDatabase = useCallback(async (searchTerm: string) => {
        if (!useDatabase) return;
        
        setIsLoading(true);
        try {
            const response = await getUsers({
                search: searchTerm,
                limit: 50, // Limit results for performance
                page: 1,
                ...(roleFilter && { role: roleFilter }),
                ...(classFilter && { classId: classFilter })
            });
            setSearchResults(response.users);
        } catch (error) {
            console.error('Error searching users:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [useDatabase, roleFilter, classFilter]);

    // Effect to trigger database search when search term changes
    useEffect(() => {
        if (useDatabase && debouncedSearchTerm && isOpen) {
            searchDatabase(debouncedSearchTerm);
        } else if (useDatabase && !debouncedSearchTerm && isOpen) {
            // Load initial users when dropdown opens without search term
            searchDatabase('');
        }
    }, [debouncedSearchTerm, useDatabase, isOpen, searchDatabase]);

    // Get filtered users based on mode (database vs in-memory)
    const filteredUsers = useMemo(() => {
        if (useDatabase) {
            return searchResults;
        }
        
        if (!debouncedSearchTerm) {
            return users;
        }
        const searchLower = debouncedSearchTerm.toLowerCase();
        return users.filter(user => {
            // Enhanced search logic to include username, name, NISN, firstName, lastName, and email
            return (
                user.name?.toLowerCase().includes(searchLower) ||
                user.username?.toLowerCase().includes(searchLower) ||
                user.firstName?.toLowerCase().includes(searchLower) ||
                user.lastName?.toLowerCase().includes(searchLower) ||
                user.email?.toLowerCase().includes(searchLower) ||
                (user.nisn && user.nisn.toLowerCase().includes(searchLower))
            );
        });
    }, [useDatabase, searchResults, users, debouncedSearchTerm]);

    const handleSelectUser = useCallback((user: User) => {
        onSelectUser(user.id);
        setIsOpen(false);
        setSearchTerm('');
        setIsSearching(false);
    }, [onSelectUser]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setIsSearching(true);
        setIsOpen(prev => prev || true);
    }, []);

    const handleInputFocus = useCallback(() => {
        setIsOpen(true);
        setIsSearching(true);
        // Load initial data when using database mode
        if (useDatabase && searchResults.length === 0) {
            searchDatabase('');
        }
    }, [useDatabase, searchResults.length, searchDatabase]);

    const handleDropdownToggle = useCallback(() => {
        setIsOpen(prev => {
            if (!prev) {
                setIsSearching(false);
                setSearchTerm('');
            }
            return !prev;
        });
    }, []);

    const handleClearSelection = useCallback(() => {
        onSelectUser('');
        setSearchTerm('');
        setIsSearching(false);
        setIsOpen(false);
    }, [onSelectUser]);

    return (
        <div 
            className="relative" 
            ref={wrapperRef}
        >
            <div className="relative">
                {selectedUser ? (
                    <div className={`absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none z-10 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(selectedUser.name || 'Unknown')}`}>
                        {getInitials(selectedUser.name || 'Unknown')}
                    </div>
                ) : (
                    <MagnifyingGlassIcon className="h-5 w-5 text-text-secondary absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none z-10" />
                )}
                <Input
                    type="text"
                    placeholder={selectedUser && !isSearching ? selectedUser.name || `${selectedUser.firstName} ${selectedUser.lastName}` : placeholder}
                    value={isSearching ? searchTerm : (selectedUser ? selectedUser.name || `${selectedUser.firstName} ${selectedUser.lastName}` : '')}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                    }}
                    required={required && !selectedUserId}
                    autoComplete="off"
                    className={`pl-10 ${selectedUser && !isSearching ? 'text-text-primary font-medium' : ''}`}
                    readOnly={selectedUser && !isSearching}
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                    {selectedUser && !isSearching && (
                        <button
                            type="button"
                            className="flex items-center px-2 text-text-secondary hover:text-text-primary transition-colors"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleClearSelection();
                            }}
                            title="Clear selection"
                        >
                            <XCircleIcon className="h-4 w-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        className="flex items-center px-2 text-text-secondary hover:text-text-primary transition-colors"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDropdownToggle();
                        }}
                    >
                        <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
            {isOpen && (
                <ul className="absolute z-20 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto animate-fade-in-up">
                    {isLoading ? (
                        <li className="p-3 text-sm text-center text-text-secondary">
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                Searching...
                            </div>
                        </li>
                    ) : filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <li key={user.id}>
                                <button
                                    type="button"
                                    className={`w-full flex items-center p-3 text-left cursor-pointer hover:bg-slate-100 ${selectedUserId === user.id ? 'bg-primary/10' : ''} border-none bg-transparent`}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSelectUser(user);
                                    }}
                     onKeyDown={(e) => {
                         if (e.key === 'Enter' || e.key === ' ') {
                             e.preventDefault();
                             e.stopPropagation();
                             handleSelectUser(user);
                         }
                     }}
                                >
                                <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm mr-3 ${getAvatarColor(user.name || `${user.firstName} ${user.lastName}` || 'Unknown')}`}>
                                    {getInitials(user.name || `${user.firstName} ${user.lastName}` || 'Unknown')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-text-primary truncate">{user.name || `${user.firstName} ${user.lastName}` || 'Unknown User'}</p>
                                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                                        {user.username && <span className="bg-slate-100 px-2 py-0.5 rounded">@{user.username}</span>}
                                        <span className="capitalize">{user.className || (user.role ? user.role.replace(/_/g, ' ') : 'No role')}</span>
                                    </div>
                                    {user.email && <p className="text-xs text-text-secondary/70 truncate mt-0.5">{user.email}</p>}
                                </div>
                                </button>
                            </li>
                        ))
                    ) : (
                        <li className="p-3 text-sm text-center text-text-secondary">
                            {useDatabase && searchTerm ? 'No users found matching your search.' : 'No users found.'}
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
});

SearchableSingleUserSelector.displayName = 'SearchableSingleUserSelector';

export default SearchableSingleUserSelector;
