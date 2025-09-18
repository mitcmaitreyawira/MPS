import React, { useMemo, useState } from 'react';
import { User, Class } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { UserGroupIcon, AcademicCapIcon, PencilIcon, TrashIcon } from '../../../assets/icons';
import EditUserModal from './EditUserModal';
import DeleteUserConfirmation from './DeleteUserConfirmation';

interface UserManagementListProps {
  users: User[];
  classes: Class[];
  onUserUpdated?: () => void;
}

interface UserListItem {
  id: string;
  name: string;
  nisn: string;
  gender: string;
  className: string;
  headTeacherName: string;
  role: string;
  points: number;
  badge: string;
  streakDay: number;
}

const UserManagementList: React.FC<UserManagementListProps> = ({ users, classes, onUserUpdated }) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleEditComplete = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
    onUserUpdated?.();
  };

  const handleDeleteComplete = () => {
    setIsDeleteModalOpen(false);
    setDeletingUser(null);
    onUserUpdated?.();
  };
  // Process data to create list items with class and head teacher information
  const listData = useMemo(() => {
    const items: UserListItem[] = [];
    
    // Helper function to get head teacher name for a class
    const getHeadTeacherName = (classId?: string): string => {
      if (!classId) return 'No Class Assigned';
      
      const classData = classes.find(cls => cls.id === classId || cls._id === classId);
      if (!classData || !classData.headTeacherId) return 'No Head Teacher';
      
      const headTeacher = users.find(user => 
        (user.id === classData.headTeacherId || user._id === classData.headTeacherId) &&
        user.roles && (user.roles.includes('teacher') || user.roles.includes('head_of_class'))
      );
      
      if (!headTeacher) return 'Head Teacher Not Found';
      
      return headTeacher.name || `${headTeacher.firstName || ''} ${headTeacher.lastName || ''}`.trim() || 'Unknown Teacher';
    };
    
    // Helper function to get class name
    const getClassName = (classId?: string): string => {
      if (!classId) return 'No Class';
      
      const classData = classes.find(cls => cls.id === classId || cls._id === classId);
      return classData?.name || 'Unknown Class';
    };
    
    // Process all users
    users.forEach(user => {
      // Include all users, not just students and teachers
      const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
      const primaryRole = user.roles?.[0] || user.role || 'user';
      
      items.push({
        id: user.id,
        name: displayName,
        nisn: user.nisn || 'N/A',
        gender: 'Not Specified', // Remove gender field since it's not in User type
        className: getClassName(user.classId),
        headTeacherName: getHeadTeacherName(user.classId),
        role: primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1),
        points: user.points || 0,
        badge: 'None', // Remove badge field since it's not in User type
        streakDay: 0 // Remove streakDay field since it's not in User type
      });
    });
    
    // Sort by class name, then by role (teachers first), then by name
    return items.sort((a, b) => {
      if (a.className !== b.className) {
        return a.className.localeCompare(b.className);
      }
      if (a.role !== b.role) {
        return a.role === 'Teacher' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [users, classes]);

  return (
    <Card 
      icon={<UserGroupIcon className="h-6 w-6 text-primary" />} 
      title="User Management List"
    >
      <div className="space-y-6">

        {/* Data Table - Scrollable */}
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  NISN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Point Head (Head Teacher)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Badge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Streak Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {listData.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {item.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {item.nisn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.gender === 'Male' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : item.gender === 'Female'
                        ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {item.gender}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.role === 'Teacher' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {item.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {item.className}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {item.headTeacherName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.badge !== 'None' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {item.badge}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.streakDay > 7 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : item.streakDay > 0
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {item.streakDay} days
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.points > 50 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : item.points > 0
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {item.points} pts
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditUser(users.find(u => u.id === item.id)!)}
                        className="flex items-center space-x-1 px-2 py-1"
                        title="Edit user"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteUser(users.find(u => u.id === item.id)!)}
                        className="flex items-center space-x-1 px-2 py-1"
                        title="Delete user"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>



        {listData.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No users found to display.</p>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditComplete}
        />
      )}

      {/* Delete User Confirmation */}
      {isDeleteModalOpen && deletingUser && (
        <DeleteUserConfirmation
          user={deletingUser}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onSuccess={handleDeleteComplete}
        />
      )}
    </Card>
  );
};

export default UserManagementList;