import React, { memo } from 'react';
import { User } from '../../../types';
import { ConfirmationModal } from '../../shared/ConfirmationModal';
import { useData } from '../../../context/DataContext';
import { useNotificationHelpers } from '../../../components/ui/Notification';

interface DeleteUserConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSuccess: () => void;
}

export const DeleteUserConfirmation: React.FC<DeleteUserConfirmationProps> = memo(({ 
    isOpen, 
    onClose, 
    user, 
    onSuccess 
}) => {
    const { deleteUser } = useData();
    const { showSuccess, showError } = useNotificationHelpers();

    const handleConfirm = async () => {
        if (!user) {
            throw new Error('No user selected for deletion');
        }

        try {
            await deleteUser(user.id);
            showSuccess('User Deleted', `${user.name} has been permanently deleted from the system.`);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to delete user:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete user. Please try again.';
            showError('Delete Failed', errorMessage);
            // Re-throw the error so ConfirmationModal can handle it
            throw error;
        }
    };

    if (!user) {
        return null;
    }

    const getUserRoleDisplay = (role: string) => {
        return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const confirmationMessage = (
        <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <span className="text-red-500 text-xl">⚠️</span>
                    </div>
                    <div className="ml-3">
                        <h4 className="text-sm font-medium text-red-800 mb-2">
                            This action cannot be undone
                        </h4>
                        <p className="text-sm text-red-700">
                            Deleting this user will permanently remove all their data, including:
                        </p>
                        <ul className="mt-2 text-sm text-red-700 list-disc list-inside space-y-1">
                            <li>User account and profile information</li>
                            <li>Point logs and achievement history</li>
                            <li>Quest participation records</li>
                            <li>Any associated class assignments</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-3">User Details:</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                    {user.email && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium text-gray-900">{user.email}</span>
                        </div>
                    )}
                    {user.nisn && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">NISN:</span>
                            <span className="font-medium text-gray-900">{user.nisn}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-gray-600">Role:</span>
                        <span className="font-medium text-gray-900">
                            {getUserRoleDisplay(user.role || 'Unknown')}
                        </span>
                    </div>
                    {user.className && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Class:</span>
                            <span className="font-medium text-gray-900">{user.className}</span>
                        </div>
                    )}
                    {user.points !== undefined && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Points:</span>
                            <span className="font-medium text-gray-900">{user.points}</span>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="text-center">
                <p className="text-sm text-gray-600">
                    Please type <strong>DELETE</strong> below to confirm this action:
                </p>
            </div>
        </div>
    );

    return (
        <ConfirmationModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            title={`Delete User: ${user.name}`}
            message={confirmationMessage}
            confirmText="Delete User"
            confirmVariant="danger"
        />
    );
});

DeleteUserConfirmation.displayName = 'DeleteUserConfirmation';

export default DeleteUserConfirmation;