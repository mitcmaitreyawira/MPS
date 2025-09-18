

import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { User, PointType, BadgeTier } from '../../../types';
import { useData } from '../../../context/DataContext';
import { BronzeMedalIcon, CheckCircleIcon } from '../../../assets/icons';
import SearchableSingleUserSelector from '../../shared/SearchableSingleUserSelector';

export const MedalAwarder: React.FC<{ students: User[], onAward: () => void }> = ({ students, onAward }) => {
    const { addPointLog } = useData();
    const [studentId, setStudentId] = useState('');
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [lastAwardedStudentName, setLastAwardedStudentName] = useState('');

    const resetForm = () => {
        setStudentId('');
        setReason('');
        setDescription('');
    };
    
    const handleAwardAnother = () => {
        resetForm();
        setError(null);
        setIsSuccess(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const selectedStudent = students.find(s => s.id === studentId);
        if (!selectedStudent || !reason) {
            setError("Please select a student and provide a medal title/reason.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        try {
            await addPointLog({
                studentId,
                points: 0, // Medals do not award points
                type: PointType.REWARD,
                category: `Medal: ${reason}`,
                description: description || reason,
            }, { 
                tier: BadgeTier.BRONZE, 
                reason: reason 
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
            <Card title="Award a Custom Bronze Medal">
                 <div className="text-center p-4 h-full flex flex-col justify-center items-center">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-secondary" />
                    <h3 className="mt-2 text-lg font-medium text-text-primary">Success!</h3>
                    <p className="mt-2 text-sm text-text-secondary">Medal awarded to {lastAwardedStudentName}.</p>
                    <Button onClick={handleAwardAnother} className="mt-6" variant="secondary">
                        Award Another Medal
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Award a Custom Bronze Medal">
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
                    <label className="block text-sm font-medium text-text-secondary mb-1">Medal Title / Reason</label>
                    <Input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g., Exceptional Leadership" required />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Description (Optional)</label>
                    <Input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide additional details..." />
                </div>
                
                {error && (
                    <p className="text-sm pt-1 text-danger">{error}</p>
                )}

                 <Button type="submit" className="w-full !mt-6" disabled={isLoading}>
                    <BronzeMedalIcon className="h-5 w-5 mr-2" />
                    {isLoading ? 'Awarding...' : 'Award Bronze Medal'}
                </Button>
            </form>
        </Card>
    );
};
