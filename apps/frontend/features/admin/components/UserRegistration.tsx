import React, { useState, useMemo, useEffect, memo } from 'react';
import { useData } from '../../../context/DataContext';
import { User, UserRole, Class } from '../../../types';
import { AdminSection, ActionBar } from '../../../components/ui/AdminSection';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { UserPlusIcon, CheckCircleIcon } from '../../../assets/icons';
import SearchableMultiUserSelector from '../../shared/SearchableMultiUserSelector';
import { UserValidationService, ValidationError } from '../../../utils/userValidation';
import { ErrorHandler } from '../../../utils/errorHandling';
import { validateClassId } from '../../../utils/validation';
import { createUser } from '../../../services/api';

// Password strength indicator component
const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
    if (!password) return null;
    
    return (
        <div className="mt-2">
            <div className="flex items-center space-x-2">
                <div className="flex-1 bg-green-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-green-500 w-full" />
                </div>
                <span className="text-sm font-medium text-green-600">
                    Accepted
                </span>
            </div>
            <p className="text-xs text-green-600 mt-1">
                ✓ Any password is accepted - no requirements
            </p>
        </div>
    );
};



// Single user registration form
const SingleUserRegistrationForm: React.FC<{
    users: User[];
    classes: Class[];
    onSuccess: () => void;
}> = memo(({ users, classes, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState<Partial<User>>({
        name: '',
        nisn: '',
        password: '',
        role: UserRole.STUDENT,
        classId: '',
        childIds: [],
        gender: '',
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
        let error = validationService.validateField(fieldName, value, formData);
        
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

    const handleChildSelectionChange = (selectedIds: string[]) => {
        setFormData({ ...formData, childIds: selectedIds });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setValidationWarnings([]);
        
        // Comprehensive validation before submission
        const validationResult = validationService.validateUser(
            formData,
            false, // This is always for new user creation
            undefined,
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
            const createPayload = {
                name: formData.name,
                nisn: formData.nisn,
                password: formData.password,
                role: formData.role, // Send as single role, API service will convert to array
                roles: formData.role ? [formData.role] : [], // Required by User type
                classId: formData.classId,
                childIds: formData.childIds,
                gender: formData.gender
            };
            
            await createUser(createPayload);
            
            setSuccessMessage(`${formData.role?.replace(/_/g, ' ').toLowerCase()} user created successfully.`);
            setIsSuccess(true);
            
            // Reset form after successful creation
            setTimeout(() => {
                setFormData({
                    name: '',
                    nisn: '',
                    password: '',
                    role: UserRole.STUDENT,
                    classId: '',
                    childIds: [],
                    gender: '',
                });
                setConfirmPassword('');
                setFieldErrors({});
                setValidationWarnings([]);
                setIsSuccess(false);
                onSuccess();
            }, 2000);
            
        } catch (err: any) {
            console.error('Error creating user:', err);
            
            // Use enhanced error handling system
            const enhancedError = await ErrorHandler.handleError(err, {
                operation: 'createUser',
                context: 'UserRegistration',
                formData: { ...formData, password: '[REDACTED]' }
            });
            
            // Handle specific error cases
            if (err.response?.status === 409) {
                const errorMessage = err.response?.data?.message || err.message || 'A user with this information already exists';
                
                if (errorMessage.toLowerCase().includes('nisn')) {
                    setFieldErrors(prev => ({
                        ...prev,
                        nisn: {
                            field: 'nisn',
                            message: 'This NISN is already registered',
                            type: 'duplicate'
                        }
                    }));
                } else {
                    setError(errorMessage);
                }
            } else {
                setError(enhancedError.userMessage || err.message || 'Failed to create user');
            }
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
                        ✅ User has been created successfully
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                <Input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    placeholder="Enter full name" 
                    required 
                    className={fieldErrors.name ? 'border-red-500' : ''}
                />
                {fieldErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.name.message}</p>
                )}
            </div>
            
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">NISN / User ID</label>
                <Input 
                    name="nisn" 
                    value={formData.nisn} 
                    onChange={handleChange} 
                    placeholder="Enter NISN or unique user ID" 
                    required 
                    className={fieldErrors.nisn ? 'border-red-500' : ''}
                />
                {fieldErrors.nisn && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.nisn.message}</p>
                )}
            </div>
            
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Gender</label>
                <Select 
                    name="gender" 
                    value={formData.gender || ''} 
                    onChange={handleChange}
                    className={fieldErrors.gender ? 'border-red-500' : ''}
                >
                    <option value="">Select gender...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </Select>
                {fieldErrors.gender && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.gender.message}</p>
                )}
            </div>
            
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">User Role</label>
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

            {/* Class Assignment for Students and Head of Class */}
            {(formData.role === UserRole.STUDENT || formData.role === UserRole.HEAD_OF_CLASS) && (
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Assign Class</label>
                    <Select name="classId" value={formData.classId || ''} onChange={handleChange} required>
                        <option value="">Select a class...</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                </div>
            )}
            
            {/* Child Assignment for Parents */}
            {formData.role === UserRole.PARENT && (
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Assign Children</label>
                    <SearchableMultiUserSelector
                        users={allStudents}
                        selectedUserIds={formData.childIds || []}
                        onSelectionChange={handleChildSelectionChange}
                        placeholder="Search and add children..."
                    />
                </div>
            )}
            
            {/* Password Fields */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Set Password</label>
                    <Input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handlePasswordChange} 
                        placeholder="Enter a secure password..." 
                        required 
                        className={fieldErrors.password ? 'border-red-500' : ''}
                    />
                    {fieldErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.password.message}</p>
                    )}
                    <PasswordStrengthIndicator password={formData.password || ''} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Confirm Password</label>
                    <Input 
                        type="password" 
                        name="confirmPassword" 
                        value={confirmPassword} 
                        onChange={handlePasswordChange} 
                        placeholder="Re-enter the password..." 
                        required 
                        className={fieldErrors.confirmPassword ? 'border-red-500' : ''}
                    />
                    {fieldErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword.message}</p>
                    )}
                </div>
            </div>
            
            {/* Error Display */}
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
                        <span>Creating User...</span>
                    </div>
                ) : (
                    'Create User'
                )}
            </Button>
        </form>
    );
});

// Bulk registration placeholder component
const BulkUserRegistrationForm: React.FC<{
    users: User[];
    classes: Class[];
    onSuccess: () => void;
}> = memo(({ users, classes, onSuccess }) => {
    return (
        <div className="text-center p-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <UserPlusIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Bulk Registration</h3>
            <p className="text-slate-500 mb-4">
                Bulk user registration functionality will be implemented in the next phase.
            </p>
            <p className="text-sm text-slate-400">
                This will support CSV import/export and mass user creation.
            </p>
        </div>
    );
});

interface UserRegistrationProps {
    users: User[];
    classes: Class[];
    onUpdate: () => void;
}

const UserRegistration: React.FC<UserRegistrationProps> = memo(({ users, classes, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

    return (
        <AdminSection
            title="User Registration"
            description="Register new users with comprehensive role support and validation"
            icon={<UserPlusIcon className="h-6 w-6" />}
            actions={
                <ActionBar>
                    <div className="flex space-x-2">
                        <Button
                            variant={activeTab === 'single' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setActiveTab('single')}
                        >
                            Single User
                        </Button>
                        <Button
                            variant={activeTab === 'bulk' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setActiveTab('bulk')}
                        >
                            Bulk Registration
                        </Button>
                    </div>
                </ActionBar>
            }
        >
            <div className="max-w-2xl mx-auto">
                {activeTab === 'single' ? (
                    <SingleUserRegistrationForm
                        users={users}
                        classes={classes}
                        onSuccess={onUpdate}
                    />
                ) : (
                    <BulkUserRegistrationForm
                        users={users}
                        classes={classes}
                        onSuccess={onUpdate}
                    />
                )}
            </div>
        </AdminSection>
    );
});

SingleUserRegistrationForm.displayName = 'SingleUserRegistrationForm';
BulkUserRegistrationForm.displayName = 'BulkUserRegistrationForm';
UserRegistration.displayName = 'UserRegistration';

export default UserRegistration;