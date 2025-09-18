
import React, { useState, useMemo } from 'react';
import { useData } from '../../../context/DataContext';
import { Class, User, UserRole } from '../../../types';
import { AdminSection, StatsRow } from '../../../components/ui/AdminSection';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { PlusCircleIcon, PencilIcon, TrashIcon, BuildingLibraryIcon, CheckCircleIcon } from '../../../assets/icons';
import SearchableSingleUserSelector from '../../shared/SearchableSingleUserSelector';
import { ConfirmationModal } from '../../shared/ConfirmationModal';
import { hasRole } from '../../../utils/roleUtils';

const ClassForm: React.FC<{ classData?: Class; users: User[], classes: Class[]; onDone: () => void }> = ({ classData, users, classes, onDone }) => {
    const { createClass, updateClass } = useData();
    const [name, setName] = useState(classData?.name || '');
    const [headTeacherId, setHeadTeacherId] = useState(classData?.headTeacherId || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const availableTeachers = useMemo(() => {
        console.log('ClassForm: Computing availableTeachers, users:', users?.length || 0, 'classes:', classes?.length || 0);
        if (!Array.isArray(classes) || !Array.isArray(users)) {
            console.log('ClassForm: Invalid data - classes or users not arrays');
            return [];
        }
        const assignedToOtherClasses = new Set(
            classes
                .filter(c => c.id !== classData?.id && c.headTeacherId)
                .map(c => c.headTeacherId)
        );
        console.log('ClassForm: Teachers assigned to other classes:', Array.from(assignedToOtherClasses));
        
        const filtered = users.filter(u => {
            console.log(`ClassForm: Checking user ${u.firstName} ${u.lastName}:`, {
                roles: u.roles,
                role: u.role,
                isArchived: u.isArchived,
                assignedToOther: assignedToOtherClasses.has(u.id)
            });
            
            // Check roles array first (new format)
            if (Array.isArray(u.roles) && u.roles.length > 0) {
                const hasTeacherRole = u.roles.some(role => 
                    role === 'teacher' || role === 'head_teacher' || role === 'head_of_class'
                );
                const isAvailable = hasTeacherRole && !u.isArchived && !assignedToOtherClasses.has(u.id);
                console.log(`ClassForm: User ${u.firstName} available (roles check):`, isAvailable);
                return isAvailable;
            }
            // Fallback to single role property (backward compatibility)
            if (u.role) {
                const hasTeacherRole = u.role === UserRole.TEACHER || u.role === UserRole.HEAD_OF_CLASS;
                const isAvailable = hasTeacherRole && !u.isArchived && !assignedToOtherClasses.has(u.id);
                console.log(`ClassForm: User ${u.firstName} available (role check):`, isAvailable);
                return isAvailable;
            }
            console.log(`ClassForm: User ${u.firstName} has no valid role`);
            return false;
        });
        
        console.log('ClassForm: Available teachers found:', filtered.length, filtered.map(t => `${t.firstName} ${t.lastName}`));
        return filtered;
    }, [users, classes, classData]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const payload = { name, headTeacherId: headTeacherId || undefined };
            console.log('ClassForm: Submitting class data:', payload);
            if (classData) {
                console.log('ClassForm: Updating existing class:', classData.id);
                await updateClass(classData.id, payload);
                setSuccessMessage('Class updated successfully.');
            } else {
                console.log('ClassForm: Creating new class');
                const newClass = await createClass(payload);
                console.log('ClassForm: Class created successfully:', newClass);
                setSuccessMessage('Class created successfully.');
            }
            setIsSuccess(true);
        } catch (err) {
            console.error('ClassForm: Error during submission:', err);
            setError((err as Error).message);
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center p-4">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-secondary" />
                <h3 className="mt-2 text-lg font-medium text-text-primary">Success!</h3>
                <p className="mt-2 text-sm text-text-secondary">{successMessage}</p>
                <Button onClick={onDone} className="mt-6" variant="secondary">
                    Close
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Class Name (e.g., Grade 10 - Section C)" required />
            <div>
                 <label className="block text-sm font-medium text-text-secondary mb-1">Head Teacher (Optional)</label>
                <SearchableSingleUserSelector
                    users={availableTeachers}
                    selectedUserId={headTeacherId}
                    onSelectUser={setHeadTeacherId}
                    placeholder="Search for an available teacher..."
                />
            </div>
            {error && <p className={`text-sm text-danger`}>{error}</p>}
            <Button type="submit" className="w-full !mt-6" disabled={isLoading}>
                {isLoading ? (classData ? 'Updating...' : 'Creating...') : (classData ? 'Update Class' : 'Create Class')}
            </Button>
        </form>
    );
};

export const ClassManagement: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const { classes, users, deleteClass } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | undefined>(undefined);
    const [deletingClass, setDeletingClass] = useState<Class | null>(null);

    const classDetails = useMemo(() => {
        console.log('ClassManagement: Computing class details, classes:', classes?.length || 0, 'classes');
        return Array.isArray(classes) ? classes.map(c => ({
            ...c,
            headTeacherName: Array.isArray(users) ? users.find(u => 
                (u.id === c.headTeacherId) && 
                u.roles && (u.roles.includes('teacher') || u.roles.includes('head_of_class'))
            )?.name || 'N/A' : 'N/A',
            studentCount: Array.isArray(users) ? users.filter(u => 
                u.classId === c.id && hasRole(u, UserRole.STUDENT)
            ).length : 0,
        })) : [];
    }, [classes, users]);

    const handleOpenModal = (classData?: Class) => {
        setEditingClass(classData);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        console.log('ClassManagement: Closing modal and triggering data refresh');
        setEditingClass(undefined);
        setIsModalOpen(false);
        onUpdate();
    };
    
    const handleDelete = async () => {
        if (!deletingClass) return;
        await deleteClass(deletingClass.id);
        onUpdate();
        setDeletingClass(null); // Close modal on success
    };

    return (
        <>
            <AdminSection
                title="Class Management"
                description={`Manage classes and assign head teachers. Total: ${classDetails.length} ${classDetails.length === 1 ? 'class' : 'classes'}`}
                icon={<BuildingLibraryIcon className="h-6 w-6" />}
                actions={
                    <Button onClick={() => handleOpenModal()}>
                        <PlusCircleIcon className="h-5 w-5 mr-2" />
                        Add Class
                    </Button>
                }
            >
                <div className="max-h-[32rem] overflow-y-auto">
                    <Table headers={['Class Name', 'Head Teacher', 'Student Count', 'Actions']}>
                        {classDetails.map(c => (
                            <tr key={c.id}>
                                <td className="px-6 py-3 font-medium text-text-primary">{c.name}</td>
                                <td className="px-6 py-3">{c.headTeacherName}</td>
                                <td className="px-6 py-3">{c.studentCount}</td>
                                <td className="px-6 py-3">
                                    <div className="flex space-x-2">
                                        <Button size="sm" variant="secondary" onClick={() => handleOpenModal(c)}><PencilIcon className="h-4 w-4" /></Button>
                                        <Button size="sm" variant="danger" onClick={() => setDeletingClass(c)}><TrashIcon className="h-4 w-4" /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </Table>
                </div>
            </AdminSection>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingClass ? 'Edit Class' : 'Create New Class'}>
                <ClassForm classData={editingClass} users={users} classes={classes} onDone={handleCloseModal} />
            </Modal>
             <ConfirmationModal 
                isOpen={!!deletingClass} 
                onClose={() => setDeletingClass(null)}
                onConfirm={handleDelete}
                title="Confirm Deletion"
                message={<p>Are you sure you want to delete the class "<strong>{deletingClass?.name}</strong>"? This will unassign all students and the head teacher. This action cannot be undone.</p>}
                confirmText="Confirm Delete"
                confirmVariant="danger"
            />
        </>
    );
};
