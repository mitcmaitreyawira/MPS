import React, { useMemo, useCallback } from 'react';
import { User, UserRole } from '../types';
import { useVirtualization } from '../hooks/useVirtualization';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { UserCircleIcon, PhoneIcon, PencilIcon, TrashIcon } from '../assets/icons';
import { getInitials } from '../utils/helpers';
interface VirtualizedUserListProps {
    users: User[];
    classes?: any[];
    allUsers?: User[];
    onUserClick?: (user: User) => void;
    onEditUser?: (user: User) => void;
    onArchiveUser?: (user: User) => void;
    onDeleteUser?: (user: User) => void;
    showActions?: boolean;
    itemHeight?: number;
    containerHeight?: number;
    overscan?: number;
    className?: string;
}

interface UserItemProps {
  user: User;
  onUserClick?: (user: User) => void;
  onEditUser?: (user: User) => void;
  onArchiveUser?: (user: User) => void;
  onDeleteUser?: (user: User) => void;
  showActions?: boolean;
  style?: React.CSSProperties;
  getHeadTeacherForClass?: (classId?: string) => string;
}

const UserItem: React.FC<UserItemProps> = ({
  user,
  onUserClick,
  onEditUser,
  onArchiveUser,
  onDeleteUser,
  showActions = true,
  style,
  getHeadTeacherForClass
}) => {
  const handleClick = useCallback(() => {
    onUserClick?.(user);
  }, [user, onUserClick]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEditUser?.(user);
  }, [user, onEditUser]);

  const handleArchive = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onArchiveUser?.(user);
  }, [user, onArchiveUser]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteUser?.(user);
  }, [user, onDeleteUser]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
      case UserRole.SUPER_SECRET_ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.TEACHER:
      case UserRole.HEAD_OF_CLASS:
        return 'bg-blue-100 text-blue-800';
      case UserRole.STUDENT:
        return 'bg-green-100 text-green-800';
      case UserRole.PARENT:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to extract grade from class name
  const extractGradeFromClassName = (className: string): string => {
    if (!className) return 'N/A';
    
    // Try to extract grade from common patterns like "Grade 10A", "10A", "X-A", etc.
    const gradeMatch = className.match(/(?:grade\s*)?([0-9]+|[IVX]+)(?:[A-Z])?/i);
    if (gradeMatch) {
      return gradeMatch[1];
    }
    
    // If no pattern matches, return the first part before any letter
    const firstPart = className.split(/[A-Z]/)[0];
    return firstPart || 'N/A';
  };

  

  const getInitials = (firstName?: string, lastName?: string, name?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
  const primaryRole = user.roles?.[0] || 'user';

  return (
    <div style={style}>
      <div 
        className={`cursor-pointer hover:shadow-md transition-shadow p-4 bg-white border border-gray-200 rounded-lg ${
          user.isArchived ? 'opacity-60 bg-gray-50' : ''
        }`}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-800">
                {getInitials(user.firstName, user.lastName, user.name)}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {displayName}
                </h3>
                {user.isArchived && (
                  <UserCircleIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                <div className="flex items-center space-x-1">
                  <span className="font-medium">NISN:</span>
                  <span>{user.nisn || 'N/A'}</span>
                </div>
                {user.contactNumber && (
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">📞 Contact:</span>
                    <span>{user.contactNumber}</span>
                  </div>
                )}
                {user.className && (
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">🏫 Class:</span>
                    <span>{user.className}</span>
                  </div>
                )}
                {user.className && (
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">📚 Grade:</span>
                    <span>{extractGradeFromClassName(user.className)}</span>
                  </div>
                )}
                {getHeadTeacherForClass?.(user.classId) && (
                   <div className="flex items-center space-x-1 sm:col-span-2">
                     <span className="font-medium">👨‍🏫 Head Teacher:</span>
                     <span>{getHeadTeacherForClass(user.classId)}</span>
                   </div>
                 )}
              </div>
              
              <div className="flex flex-wrap gap-1">
                {user.roles?.map((role, index) => (
                  <span 
                    key={index} 
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      getRoleBadgeColor(role)
                    }`}
                  >
                    {role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="relative">
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  // Simple action menu - could be expanded with a proper dropdown
                  const action = window.confirm('Choose action: OK for Edit, Cancel for Archive');
                  if (action) {
                    onEditUser?.(user);
                  } else {
                    onArchiveUser?.(user);
                  }
                }}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * VirtualizedUserList component for efficiently rendering large lists of users
 * Uses virtualization to only render visible items for optimal performance
 */
export const VirtualizedUserList: React.FC<VirtualizedUserListProps> = ({
  users,
  classes = [],
  allUsers = [],
  onUserClick,
  onEditUser,
  onArchiveUser,
  onDeleteUser,
  showActions = true,
  itemHeight = 120,
  containerHeight = 600,
  overscan = 5,
  className = ''
}) => {
    // Helper function to get head teacher for a class
    const getHeadTeacherForClass = (classId?: string): string => {
        if (!classId || !classes || !allUsers) return '';
        
        // Find the class by ID
        const classData = classes.find(cls => cls.id === classId || cls._id === classId);
        if (!classData || !classData.headTeacherId) return '';
        
        // Find the head teacher user
        const headTeacher = allUsers.find(user => 
            (user.id === classData.headTeacherId || user._id === classData.headTeacherId) &&
            user.roles && (user.roles.includes('teacher') || user.roles.includes('head_of_class'))
        );
        if (!headTeacher) return '';
        
        return headTeacher.name || `${headTeacher.firstName || ''} ${headTeacher.lastName || ''}`.trim();
    };

  // Memoize user items to prevent unnecessary re-renders
  const userItems = useMemo(() => users, [users]);

  // Use virtualization hook for performance
  const {
    startIndex,
    visibleItems,
    totalHeight,
    scrollToIndex
  } = useVirtualization(userItems, {
    itemHeight,
    containerHeight,
    overscan
  });

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Render function for each visible item
  const renderItem = useCallback((user: User, index: number) => {
    if (!user || !user.id) {
      return null;
    }
    
    const style: React.CSSProperties = {
      position: 'absolute',
      top: (startIndex + index) * itemHeight,
      left: 0,
      right: 0,
      height: itemHeight
    };
    
    return (
      <UserItem
        key={user.id}
        user={user}
        onUserClick={onUserClick}
        onEditUser={onEditUser}
        onArchiveUser={onArchiveUser}
        onDeleteUser={onDeleteUser}
        showActions={showActions}
        style={style}
        getHeadTeacherForClass={getHeadTeacherForClass}
      />
    );
  }, [onUserClick, onEditUser, onArchiveUser, onDeleteUser, showActions, itemHeight, startIndex, getHeadTeacherForClass]);

  // Handle empty state
  if (users.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-500 ${className}`}>
        <div className="text-center">
          <UserCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">No users found</p>
          <p className="text-sm">Try adjusting your search filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Performance stats for debugging */}
      <div className="mb-4 text-xs text-gray-500">
        Showing {visibleItems.length} of {users.length} users (virtualized)
      </div>
      
      {/* Virtualized container */}
      <div 
        ref={containerRef}
        className="overflow-auto border rounded-lg"
        style={{ height: containerHeight }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {visibleItems.map((user, index) => renderItem(user, index))}
        </div>
      </div>
      
      {/* Scroll to top button for long lists */}
      {users.length > 20 && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => scrollToIndex(0)}
        >
          Scroll to Top
        </Button>
      )}
    </div>
  );
};

export default VirtualizedUserList;