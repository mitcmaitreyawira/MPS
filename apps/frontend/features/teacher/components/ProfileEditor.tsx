
import React, { useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { UserRole } from '../../../types';
import { AcademicCapIcon, CheckCircleIcon } from '../../../assets/icons';

export const ProfileEditor: React.FC = () => {
    const { user, updateAuthUser } = useAuth();
    const { updateUser } = useData();

    const [subject, setSubject] = useState(user?.subject || '');
    const [contactNumber, setContactNumber] = useState(user?.contactNumber || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!user) {
        return <p>User not found.</p>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);
        try {
            const updatedUserData = await updateUser(user.id, {
                subject,
                contactNumber,
            });
            updateAuthUser(updatedUserData);
            setIsSuccess(true);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEditAgain = () => {
        setIsSuccess(false);
        setError(null);
    };

    const isHeadTeacher = user.role === UserRole.HEAD_OF_CLASS;

    return (
        <div className="max-w-lg mx-auto">
             {isHeadTeacher && user.className && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg mb-6 flex items-start space-x-4">
                    <AcademicCapIcon className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-primary">Head of Class Status</h4>
                        <p className="text-text-primary">You are assigned as the Head of: <strong>{user.className}</strong></p>
                        <p className="text-xs text-text-secondary mt-1">This role is managed by an administrator.</p>
                    </div>
                </div>
            )}
            {isSuccess ? (
                <div className="text-center p-4">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-secondary" />
                    <h3 className="mt-2 text-lg font-medium text-text-primary">Profile Updated!</h3>
                    <p className="mt-2 text-sm text-text-secondary">Your changes have been saved successfully.</p>
                    <Button onClick={handleEditAgain} className="mt-6" variant="secondary">
                        Make Another Change
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                        <Input type="text" value={user.name} readOnly disabled className="bg-slate-100 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">NISN / User ID</label>
                        <Input type="text" value={user.nisn} readOnly disabled className="bg-slate-100 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                        <Input type="email" value={user.email} readOnly disabled className="bg-slate-100 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Subject(s)</label>
                        <Input 
                            type="text" 
                            value={subject} 
                            onChange={e => setSubject(e.target.value)} 
                            placeholder="e.g., Math, Science" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Contact Number</label>
                        <Input 
                            type="tel" 
                            value={contactNumber} 
                            onChange={e => setContactNumber(e.target.value)} 
                            placeholder="e.g., 555-123-4567"
                        />
                    </div>
                     {error && (
                        <div className="text-center text-sm p-3 rounded-lg bg-red-100 text-red-800">
                            {error}
                        </div>
                    )}
                    <Button type="submit" className="w-full !mt-8" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            )}
        </div>
    );
};
