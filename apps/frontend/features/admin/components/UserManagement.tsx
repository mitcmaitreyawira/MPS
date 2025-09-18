
import React, { useState, useMemo, useEffect, memo } from 'react';
import { useData } from '../../../context/DataContext';
import { User, UserRole, Class, PointLog } from '../../../types';
import { AdminSection, FilterSection, ActionBar } from '../../../components/ui/AdminSection';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { UserPlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, ArrowUturnLeftIcon, CheckCircleIcon } from '../../../assets/icons';
import StudentStatsDisplay from './StudentStatsDisplay';
import { getInitials, getAvatarColor } from '../../../utils/helpers';
// Removed Pagination import - using scroll instead
import SearchableMultiUserSelector from '../../shared/SearchableMultiUserSelector';
import { ConfirmationModal } from '../../shared/ConfirmationModal';
import { useDebounce } from '../../../hooks/useDebounce';
import { UserValidationService, ValidationError, validatePassword } from '../../../utils/userValidation';
import { ErrorHandler, ErrorType, ErrorSeverity } from '../../../utils/errorHandling';
import { validateClassId } from '../../../utils/validation';
import AdvancedSearchFilters, { SearchFilters } from '../../../components/AdvancedSearchFilters';
import { VirtualizedUserList } from '../../../components/VirtualizedUserList';
import { useOptimizedUserSearch } from '../../../hooks/useOptimizedUserSearch';
import UserManagementList from './UserManagementList';
// Removed DuplicateDetectionService - using backend validation only

// Password strength indicator component removed

const UserForm: React.FC<{ user: User; users: User[]; classes: Class[]; points: PointLog[]; onDone: () => void }> = memo(({ user, users, classes, points, onDone }) => {
    const { updateUser } = useData();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState<Partial<User>>({
        name: user?.name || '',
        nisn: user?.nisn || '',
        password: '',
        role: user?.role || UserRole.STUDENT,
        classId: user?.classId || '',
        childIds: user?.childIds || [],
        subject: user?.subject || '',
    });
    const [confirmPassword, setConfirmPassword] = useState('');

    const [fieldErrors, setFieldErrors] = useState<Record<string, ValidationError>>({});
    const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
    const [validationService] = useState(() => new UserValidationService(users));

    // Update validation service when users change
    useEffect(() => {
        validationService.updateExistingUsers(users);
    }, [users, validationService]);

    // Real-time field validation
    const validateFieldRealTime = (fieldName: string, value: any) => {
        let error = validationService.validateField(fieldName, value, formData, user?.id);
        
        // Additional ObjectId validation for classId field
        if (fieldName === 'classId' && value && value.trim() !== '') {
            const classIdValidation = validateClassId(value);
            if (!classIdValidation.isValid) {
                error = { message: classIdValidation.error || 'Invalid class ID format' };
            }
        }
        
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            if (error) {
                newErrors[fieldName] = error;
            } else {
                delete newErrors[fieldName];
            }
            return newErrors;
        });
    };



    const allStudents = useMemo(() => users.filter(u => u.role === UserRole.STUDENT && !u.isArchived), [users]);
    
    const parentUser = useMemo(() => {
        if (!user || user.role !== UserRole.STUDENT) return null;
        return users.find(u => u.role === UserRole.PARENT && u.childIds?.includes(user.id));
    }, [user, users]);

    const handleChildSelectionChange = (selectedIds: string[]) => {
        setFormData({ ...formData, childIds: selectedIds });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        const newFormData = { ...formData, [name]: value };
        
        if (name === 'role') {
            if (value !== UserRole.PARENT) {
                newFormData.childIds = [];
            }
            if (value !== UserRole.STUDENT && value !== UserRole.HEAD_OF_CLASS) {
                newFormData.classId = '';
            }
        }
        
        setFormData(newFormData);
        
        // Real-time validation
        setTimeout(() => validateFieldRealTime(name, value), 0);
    };
    
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'confirmPassword') {
            setConfirmPassword(value);
            // Validate password match
            setTimeout(() => {
                if (formData.password && value && formData.password !== value) {
                    setFieldErrors(prev => ({
                        ...prev,
                        confirmPassword: {
                            field: 'confirmPassword',
                            message: 'Passwords do not match',
                            type: 'mismatch'
                        }
                    }));
                } else {
                    setFieldErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.confirmPassword;
                        return newErrors;
                    });
                }
            }, 0);
        } else {
            handleChange(e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setValidationWarnings([]);
        
        // Comprehensive validation before submission
        const validationResult = validationService.validateUser(
            formData,
            !!user,
            user?.id,
            confirmPassword
        );
        
        if (!validationResult.isValid) {
            // Display validation errors
            const errorMessages = validationResult.errors.map(err => 
                `${err.field}: ${err.message}`
            ).join('\n');
            setError(`❌ Validation Failed\n\n${errorMessages}\n\nPlease correct the errors above and try again.`);
            
            // Set field-specific errors
            const fieldErrorMap: Record<string, ValidationError> = {};
            validationResult.errors.forEach(err => {
                fieldErrorMap[err.field] = err;
            });
            setFieldErrors(fieldErrorMap);
            return;
        }
        
        // Show warnings if any
        if (validationResult.warnings.length > 0) {
            setValidationWarnings(validationResult.warnings);
        }

        setIsLoading(true);
        try {
            // Only allow updating existing users, no creation
            const updatePayload = {
                name: formData.name,
                nisn: formData.nisn,
                role: formData.role,
                classId: formData.classId,
                childIds: formData.childIds,
                subject: formData.subject,
                ...(formData.password && { password: formData.password }), // Include password only if provided
            };
            await updateUser(user.id, updatePayload);
            setSuccessMessage('User updated successfully.');
            setIsSuccess(true);
            // Trigger parent component refresh after success
            setTimeout(() => onDone(), 1500);
        } catch (err: any) {
            console.error('Error creating/updating user:', err);
            
            // Use enhanced error handling system for user updates
            const enhancedError = await ErrorHandler.handleError(err, {
                operation: 'updateUser',
                context: 'UserForm',
                formData: { ...formData, password: '[REDACTED]' }
            });
            
            // Handle duplicate email errors with clear messaging
            if (err.response?.status === 409) {
                const errorMessage = err.response?.data?.message || err.message || 'A user with this information already exists';
                
                if (errorMessage.toLowerCase().includes('email')) {
                    setError('This email address is already registered. Please use a different email address or check if the user already exists.');
                    setFieldErrors(prev => ({
                        ...prev,
                        email: {
                            field: 'email',
                            message: 'This email is already registered',
                            type: 'duplicate'
                        }
                    }));
                } else if (errorMessage.toLowerCase().includes('nisn')) {
                    setFieldErrors(prev => ({
                        ...prev,
                        nisn: {
                            field: 'nisn',
                            message: 'This NISN is already registered',
                            type: 'duplicate'
                        }
                    }));
                } else if (errorMessage.toLowerCase().includes('username')) {
                    setFieldErrors(prev => ({
                        ...prev,
                        username: {
                            field: 'username',
                            message: 'This username is already taken',
                            type: 'duplicate'
                        }
                    }));
                } else {
                    setError(errorMessage);
                }
            } else {
                setError(enhancedError.userMessage || err.message || 'Failed to update user');
            }
            
            // Log error for debugging
            console.error('[UserForm] Error creating user:', err);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isSuccess) {
        return (
            <div className="text-center p-6 animate-fade-in">
                <div className="animate-bounce">
                    <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-text-primary">Success!</h3>
                <p className="mt-3 text-base text-text-secondary">{successMessage}</p>
                <div className="mt-6 space-y-2">
                    <div className="text-sm text-green-600 bg-green-50 rounded-lg p-3">
                        ✅ User has been updated successfully
                    </div>
                    <Button onClick={onDone} className="mt-4" variant="secondary">
                        Close
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Statistics Display */}
            {user && user.role === UserRole.STUDENT && (
                <StudentStatsDisplay user={user} points={points} awards={[]} />
            )}
            
            {/* Validation Warnings */}
            {validationWarnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <span className="text-yellow-400">⚠️</span>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Validation Warnings</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <ul className="list-disc pl-5 space-y-1">
                                    {validationWarnings.map((warning, index) => (
                                        <li key={index}>{warning.message}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div>
                <Input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Full Name" 
                    required 
                    className={fieldErrors.name ? 'border-red-500' : ''}
                />
                {fieldErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.name.message}</p>
                )}
            </div>
            
            <div>
                <Input 
                    name="nisn" 
                    value={formData.nisn} 
                    onChange={handleChange} 
                    placeholder="NISN / User ID" 
                    required 
                    className={fieldErrors.nisn ? 'border-red-500' : ''}
                />
                {fieldErrors.nisn && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.nisn.message}</p>
                )}
            </div>
            
            <div>
                <Select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange}
                    className={fieldErrors.role ? 'border-red-500' : ''}
                >
                    {Object.values(UserRole).map(role => (
                        <option key={role} value={role}>
                            {role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                    ))}
                </Select>
                {fieldErrors.role && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.role.message}</p>
                )}
            </div>

            {/* Subject field for teachers */}
            {(formData.role === UserRole.TEACHER || formData.role === UserRole.HEAD_OF_CLASS) && (
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Subject(s)</label>
                    <Input 
                        name="subject" 
                        value={formData.subject || ''} 
                        onChange={handleChange} 
                        placeholder="e.g., Mathematics, Science, English" 
                        className={fieldErrors.subject ? 'border-red-500' : ''}
                    />
                    {fieldErrors.subject && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.subject.message}</p>
                    )}
                    <p className="mt-1 text-xs text-text-secondary">Enter the subject(s) this teacher teaches, separated by commas</p>
                </div>
            )}

            {/* Class assignment for students and head teachers */}
            {(formData.role === UserRole.STUDENT || formData.role === UserRole.HEAD_OF_CLASS) && (
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        {formData.role === UserRole.HEAD_OF_CLASS ? 'Head Teacher of Class' : 'Student Class'}
                    </label>
                    <Select name="classId" value={formData.classId || ''} onChange={handleChange} required>
                        <option value="">{formData.role === UserRole.HEAD_OF_CLASS ? 'Select class to lead...' : 'Assign a class...'}</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                    {formData.role === UserRole.HEAD_OF_CLASS && (
                        <p className="mt-1 text-xs text-text-secondary">This teacher will be the head teacher of the selected class</p>
                    )}
                </div>
            )}
            
            {/* Optional class assignment for regular teachers */}
            {formData.role === UserRole.TEACHER && (
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Teaching Classes (Optional)</label>
                    <Select name="classId" value={formData.classId || ''} onChange={handleChange}>
                        <option value="">No specific class assigned</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                    <p className="mt-1 text-xs text-text-secondary">Teachers can teach multiple classes, but this sets their primary class</p>
                </div>
            )}
            {formData.role === UserRole.PARENT && (
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Assigned Children</label>
                    <SearchableMultiUserSelector
                        users={allStudents}
                        selectedUserIds={formData.childIds || []}
                        onSelectionChange={handleChildSelectionChange}
                        placeholder="Search and add children..."
                    />
                </div>
            )}
            {user && user.role === UserRole.STUDENT && (
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Assigned Parent</label>
                    <Input 
                        type="text" 
                        value={parentUser ? parentUser.name : 'No parent assigned'} 
                        readOnly 
                        disabled 
                        className="bg-slate-100 cursor-not-allowed" 
                    />
                </div>
            )}
             <div className="space-y-4">
                {user && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-blue-400">ℹ️</span>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">Current Password</h3>
                                <div className="mt-1 text-sm text-blue-700">
                                    <p>User Password: {user.password || 'Password not available for security reasons'}</p>
                                    <p className="text-xs mt-1">Leave password field blank to keep current password unchanged</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                        {user ? 'Change Password (Optional)' : 'Set Password'}
                    </label>
                    <Input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handlePasswordChange} 
                        placeholder={user ? "Leave blank to keep current password" : "Enter a secure password..."} 
                        required={!user} 
                        className={fieldErrors.password ? 'border-red-500' : ''}
                    />
                    {fieldErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.password.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Confirm Password</label>
                    <Input 
                        type="password" 
                        name="confirmPassword" 
                        value={confirmPassword} 
                        onChange={handlePasswordChange} 
                        placeholder={user ? "Confirm new password if changing" : "Re-enter the password..."} 
                        required={!user || (user && formData.password)} 
                        className={fieldErrors.confirmPassword ? 'border-red-500' : ''}
                    />
                    {fieldErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword.message}</p>
                    )}
                </div>
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
            <Button type="submit" className="w-full !mt-6" disabled={isLoading}>
                {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{user ? 'Updating...' : 'Creating...'}</span>
                    </div>
                ) : (
                    user ? 'Update User' : 'Create User'
                )}
            </Button>
        </form>
    );
});

// Removed ITEMS_PER_PAGE - using scroll instead of pagination

interface UserManagementProps {
    users: User[];
    classes: Class[];
    points: PointLog[];
    onUpdate: () => void;
}

const UserManagement: React.FC<UserManagementProps> = memo(({ users, classes, points, onUpdate }) => {
    const { archiveUser, restoreUser } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
    
    const [userToArchive, setUserToArchive] = useState<User | null>(null);
    const [userToRestore, setUserToRestore] = useState<User | null>(null);


    const [filters, setFilters] = useState<SearchFilters>({
        search: '',
        role: '',
        classId: '',
        sortBy: 'firstName',
        sortOrder: 'asc',
        includeArchived: false,
    });
    // Use optimized search hook for better performance
    const { filteredUsers, totalCount, isFiltering } = useOptimizedUserSearch(
        users,
        filters
    );

    // Compute total points per student
    const pointsByStudent = useMemo(() => {
        const map: Record<string, number> = {};
        if (!points) return map;
        for (const p of points) {
            const sid = p.studentId;
            if (!sid) continue;
            map[sid] = (map[sid] || 0) + (p.points || 0);
        }
        return map;
    }, [points]);
    // No pagination - show all filtered users with scrolling

    // Create a map of classId to className for efficient lookup
    const classNameMap = useMemo(() => {
        const map: Record<string, string> = {};
        if (classes) {
            classes.forEach(cls => {
                map[cls.id] = cls.name;
            });
        }
        return map;
    }, [classes]);

    // Create a map of head teacher ID to their class for linking
    const headTeacherToClass = useMemo(() => {
        const map: Record<string, { classId: string; className: string }> = {};
        if (classes) {
            classes.forEach(cls => {
                if (cls.headTeacherId) {
                    map[cls.headTeacherId] = {
                        classId: cls.id,
                        className: cls.name
                    };
                }
            });
        }
        return map;
    }, [classes]);

    // Function to handle clicking on a head teacher name
    const handleHeadTeacherClick = (classId: string) => {
        // Set class filter to show the specific class
        setFilters(prev => ({
            ...prev,
            classId: classId,
            role: 'all',
            search: ''
        }));
    };

    const handleOpenModal = (user: User) => {
        // Only allow editing existing users, not creating new ones
        if (!user) return;
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingUser(undefined);
        setIsModalOpen(false);
        // Force refresh data when modal closes
        onUpdate();
    };
    
    const handleConfirmArchive = async () => {
        if (!userToArchive) return;
        try {
            await archiveUser(userToArchive.id);
            onUpdate(); // Force refresh data
            setUserToArchive(null); // Close modal on success
        } catch (error) {
            console.error('Error archiving user:', error);
        }
    };

    const handleConfirmRestore = async () => {
        if (!userToRestore) return;
        try {
            await restoreUser(userToRestore.id);
            onUpdate(); // Force refresh data
            setUserToRestore(null); // Close modal on success
        } catch (error) {
            console.error('Error restoring user:', error);
        }
    };
    
    return (
        <>
            <AdminSection
                title={`User Management (${filteredUsers.length})`}
                description="Manage users, roles, and permissions across the system"
                icon={<UserPlusIcon className="h-6 w-6" />}
                actions={
                    <AdvancedSearchFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                    />
                }
            >


                {/* Performance indicator */}
                {isFiltering && (
                    <div className="mb-4 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                        Filtering {users.length} users...
                    </div>
                )}
                
                <UserManagementList users={filteredUsers} classes={classes} onUserUpdated={onUpdate} />
            </AdminSection>
            {editingUser && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Edit User">
                    <UserForm user={editingUser} users={users} classes={classes} points={points} onDone={handleCloseModal} />
                </Modal>
            )}
            <ConfirmationModal
                isOpen={!!userToArchive}
                onClose={() => setUserToArchive(null)}
                onConfirm={handleConfirmArchive}
                title="Confirm Archive"
                message={
                    <p>
                        Are you sure you want to archive <strong>{userToArchive?.name}</strong>?
                        <br /><br />
                        This will disable their account, preventing them from logging in. Their data will be preserved for historical records and can be restored later.
                    </p>
                }
                confirmText="Confirm Archive"
                confirmVariant="danger"
            />
            <ConfirmationModal
                isOpen={!!userToRestore}
                onClose={() => setUserToRestore(null)}
                onConfirm={handleConfirmRestore}
                title="Confirm Restore"
                message={
                     <p>
                        Are you sure you want to restore <strong>{userToRestore?.name}</strong>?
                        <br /><br />
                        They will be able to log in again.
                    </p>
                }
                confirmText="Confirm Restore"
                confirmVariant="secondary"
            />
        </>
    );
});

UserForm.displayName = 'UserForm';
UserManagement.displayName = 'UserManagement';

export default UserManagement;