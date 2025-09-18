import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { User, AwardTier, AwardType } from '../../../types';
import * as api from '../../../services/api';
import { AwardIcon, CheckCircleIcon } from '../../../assets/icons';
import SearchableSingleUserSelector from '../../shared/SearchableSingleUserSelector';

export const BronzeAwardManager: React.FC<{ students: User[], onAward: () => void }> = ({ students, onAward }) => {
    const [studentId, setStudentId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [reason, setReason] = useState('');
    const [icon, setIcon] = useState('🏆');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [lastAwardedStudentName, setLastAwardedStudentName] = useState('');

    const resetForm = () => {
        setStudentId('');
        setName('');
        setDescription('');
        setReason('');
        setIcon('🏆');
    };
    
    const handleAwardAnother = () => {
        resetForm();
        setError(null);
        setIsSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const selectedStudent = students.find(s => s.id === studentId);
        if (!selectedStudent || !name || !reason) {
            setError("Please select a student, provide an award name, and reason.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        try {
            await api.createAward({
                recipientId: studentId,
                tier: AwardTier.BRONZE,
                type: AwardType.BEHAVIOR,
                name,
                description: description || reason,
                reason,
                icon: icon || '🏆'
            });
            onAward();
            setIsSuccess(true);
            setLastAwardedStudentName(selectedStudent.name);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
         return (
            <Card title="Award Bronze Recognition">
                 <div className="text-center p-4 h-full flex flex-col justify-center items-center">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-secondary" />
                    <h3 className="mt-2 text-lg font-medium text-text-primary">Success!</h3>
                    <p className="mt-2 text-sm text-text-secondary">Bronze award granted to {lastAwardedStudentName}.</p>
                    <Button onClick={handleAwardAnother} className="mt-6" variant="secondary">
                        Award Another Student
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Award Bronze Recognition">
            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Student</label>
                    <SearchableSingleUserSelector
                        users={students}
                        selectedUserId={studentId}
                        onSelectUser={(id) => { setStudentId(id); setError(null); }}
                        placeholder="Search and select a student..."
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Award Name</label>
                    <Input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="e.g., Outstanding Leadership" 
                        required 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Reason</label>
                    <Input 
                        type="text" 
                        value={reason} 
                        onChange={e => setReason(e.target.value)} 
                        placeholder="e.g., Showed exceptional leadership during group project" 
                        required 
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Description (Optional)</label>
                    <Input 
                        type="text" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        placeholder="Provide additional details..." 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Icon</label>
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl">{icon}</span>
                        <Input 
                            type="text" 
                            value={icon} 
                            onChange={e => setIcon(e.target.value)} 
                            placeholder="🏆" 
                            className="flex-1"
                        />
                    </div>
                    <p className="text-xs text-text-secondary mt-1">Choose an emoji or text icon for this award</p>
                </div>
                
                {error && (
                    <p className="text-sm pt-1 text-danger">{error}</p>
                )}

                 <Button type="submit" className="w-full !mt-6" disabled={isLoading}>
                    <AwardIcon className="h-5 w-5 mr-2" />
                    {isLoading ? 'Granting Award...' : 'Grant Bronze Award'}
                </Button>
            </form>
        </Card>
    );
};