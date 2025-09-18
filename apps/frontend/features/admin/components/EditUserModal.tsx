import React, { useState, useEffect, memo } from 'react';
import { User, UserRole, Class } from '../../../types';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useData } from '../../../context/DataContext';
import { ValidationError } from '../../../utils/userValidation';
import { ErrorHandler } from '../../../utils/errorHandling';
import { useNotificationHelpers } from '../../../components/ui/Notification';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    classes: Class[];
    onSuccess: () => void;
}

interface FormData {
    name: string;
    points: number;
    classId?: string;
}

interface FieldErrors {
    [key: string]: ValidationError;
}

export const EditUserModal: React.FC<EditUserModalProps> = memo(({ 
    isOpen, 
    onClose, 
    user, 
    classes, 
    onSuccess 
}) => {
    const { updateUser } = useData();
    const { showSuccess, showError } = useNotificationHelpers();
    const [formData, setFormData] = useState<FormData>({
        name: '',
        points: 0,
        classId: undefined
    });
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Initialize form data when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                points: user.points || 0,
                classId: user.classId || undefined
            });
            setFieldErrors({});
            setError('');
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const errors: FieldErrors = {};
        
        try {
            // Validate name
            if (!formData.name.trim()) {
                errors.name = { field: 'name', message: 'Name is required', type: 'required' };
            } else if (formData.name.trim().length < 2) {
                errors.name = { field: 'name', message: 'Name must be at least 2 characters long', type: 'format' };
            }

            // Validate points
            if (formData.points < 0) {
                errors.points = { field: 'points', message: 'Points cannot be negative', type: 'format' };
            } else if (!Number.isInteger(formData.points)) {
                errors.points = { field: 'points', message: 'Points must be a whole number', type: 'format' };
            }

            setFieldErrors(errors);
            return Object.keys(errors).length === 0;
        } catch (validationError) {
            console.error('Validation error:', validationError);
            setError('Validation failed. Please check your input.');
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const updateData = {
                ...formData,
                name: formData.name.trim(),
                points: formData.points,
                classId: formData.classId || undefined
            };

            await updateUser(user.id, updateData);
            showSuccess('User Updated', `${formData.name}'s information has been updated successfully.`);
            onSuccess();
            onClose();
        } catch (updateError) {
            console.error('Update error:', updateError);
            const errorMessage = updateError instanceof Error ? updateError.message : 'Failed to update user. Please try again.';
            showError('Update Failed', errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    const availableClasses = classes?.filter(cls => cls.status === 'active') || [];

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Edit User: ${user?.name || 'Unknown User'}`}
            size="md"
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        Full Name *
                    </label>
                    <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter full name..."
                        required
                        disabled={isLoading}
                        className={fieldErrors.name ? 'border-red-500' : ''}
                    />
                    {fieldErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.name.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        Points *
                    </label>
                    <Input
                        type="number"
                        name="points"
                        value={formData.points}
                        onChange={handleInputChange}
                        placeholder="Enter points..."
                        min="0"
                        step="1"
                        required
                        disabled={isLoading}
                        className={fieldErrors.points ? 'border-red-500' : ''}
                    />
                    {fieldErrors.points && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.points.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        Class
                    </label>
                    <Select
                        name="classId"
                        value={formData.classId || ''}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={fieldErrors.classId ? 'border-red-500' : ''}
                    >
                        <option value="">Select a class...</option>
                        {availableClasses.map(cls => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name}
                            </option>
                        ))}
                    </Select>
                    {fieldErrors.classId && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.classId.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        Day Streak
                    </label>
                    <Input
                        type="number"
                        value={user?.streak || 0}
                        disabled={true}
                        className="bg-gray-100 cursor-not-allowed"
                        placeholder="Calculated automatically"
                    />
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 animate-shake">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-red-400">❌</span>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-2 text-sm text-red-700 whitespace-pre-line">
                                    {error}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex space-x-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Updating...</span>
                            </div>
                        ) : (
                            'Update User'
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
});

EditUserModal.displayName = 'EditUserModal';

export default EditUserModal;