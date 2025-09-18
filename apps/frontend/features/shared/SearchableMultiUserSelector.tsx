
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User } from '../../types';
import { XCircleIcon } from '../../assets/icons';
import { getAvatarColor, getInitials } from '../../utils/helpers';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchableMultiUserSelectorProps {
    users: User[];
    selectedUserIds: string[];
    onSelectionChange: (ids: string[]) => void;
    placeholder?: string;
}

const SearchableMultiUserSelector: React.FC<SearchableMultiUserSelectorProps> = ({
    users,
    selectedUserIds,
    onSelectionChange,
    placeholder = 'Search users...'
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const selectedUsers = useMemo(() => {
        return users.filter(u => selectedUserIds.includes(u.id));
    }, [users, selectedUserIds]);

    const availableUsers = useMemo(() => {
        const lowercasedSearchTerm = debouncedSearchTerm.toLowerCase();
        return users.filter(user => 
            !selectedUserIds.includes(user.id) &&
            user.name.toLowerCase().includes(lowercasedSearchTerm)
        );
    }, [users, selectedUserIds, debouncedSearchTerm]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    const handleAddUser = (userId: string) => {
        onSelectionChange([...selectedUserIds, userId]);
        setSearchTerm('');
        // Keep the dropdown open for multiple selections
        // setIsOpen(false); 
        inputRef.current?.focus();
    };
    
    const handleRemoveUser = (userId: string) => {
        onSelectionChange(selectedUserIds.filter(id => id !== userId));
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div 
                className="flex flex-wrap gap-2 items-center p-2 border border-border rounded-lg bg-surface focus-within:ring-2 focus-within:ring-primary"
                onClick={() => inputRef.current?.focus()}
            >
                {selectedUsers.map(user => (
                    <span key={user.id} className="flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-medium px-2 py-1 rounded-full">
                        {user.name}
                        <button type="button" onClick={() => handleRemoveUser(user.id)} className="text-primary/70 hover:text-primary">
                            <XCircleIcon className="h-4 w-4" />
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder={selectedUserIds.length > 0 ? '' : placeholder}
                    className="flex-grow bg-transparent outline-none text-text-primary placeholder-text-secondary/70 text-sm p-1"
                />
            </div>
            {isOpen && (
                <ul className="absolute z-20 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto animate-fade-in-up">
                    {availableUsers.length > 0 ? (
                        availableUsers.map(user => (
                            <li
                                key={user.id}
                                className="flex items-center p-3 cursor-pointer hover:bg-slate-100"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleAddUser(user.id);
                                }}
                            >
                                <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm mr-3 ${getAvatarColor(user.name)}`}>
                                    {getInitials(user.name)}
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary">{user.name}</p>
                                    <p className="text-xs text-text-secondary">{user.className}</p>
                                </div>
                            </li>
                        ))
                    ) : (
                         <li className="p-3 text-sm text-center text-text-secondary">
                            {searchTerm ? 'No matching users found.' : 'All users are selected or no users available.'}
                         </li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default SearchableMultiUserSelector;