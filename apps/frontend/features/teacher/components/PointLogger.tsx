
import React, { useState, useMemo, useEffect } from 'react';
import { User, PointType, ActionPreset, ActionType } from '../../../types';
import { useData } from '../../../context/DataContext';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import SearchableSingleUserSelector from '../../shared/SearchableSingleUserSelector';
import { CheckCircleIcon } from '../../../assets/icons';

interface PointLoggerProps {
    students: User[];
    logType: PointType.REWARD | PointType.VIOLATION;
    onStudentSelect: (studentId: string | null) => void;
    onUpdate: () => void;
}

export const PointLogger: React.FC<PointLoggerProps> = ({ students, logType, onStudentSelect, onUpdate }) => {
    const { addPointLog, actionPresets } = useData();
    const [studentId, setStudentId] = useState('');
    const [numPoints, setNumPoints] = useState(logType === PointType.REWARD ? 10 : 5);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [selectedPresetId, setSelectedPresetId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [lastLoggedStudentName, setLastLoggedStudentName] = useState('');

    const availablePresets = useMemo(() => {
        const target = logType === PointType.REWARD ? 'REWARD' : 'VIOLATION';
        return (actionPresets ?? []).filter((p: any) => 
            String(p?.type ?? '').toUpperCase() === target && !Boolean(p?.isArchived)
        );
    }, [actionPresets, logType]);

    useEffect(() => {
        onStudentSelect(studentId || null);
    }, [studentId, onStudentSelect]);
    
    // Resets the form when switching between "Reward" and "Violation"
    useEffect(() => {
        resetForm(false); // Don't reset studentId when type changes
    }, [logType]);
    
    const handlePresetChange = (presetId: string) => {
        setSelectedPresetId(presetId);
        setError(null);
        const preset = availablePresets.find((p: any) => String(p.id) === String(presetId));
        if (preset) {
            setNumPoints(Math.abs(Number(preset.points) || 0));
            setCategory(preset.category || '');
            setDescription(preset.description || '');
        } else {
            // Manual entry
            setNumPoints(logType === PointType.REWARD ? 10 : 5);
            setCategory('');
            setDescription('');
        }
    };

    const resetForm = (resetStudent = true) => {
        if (resetStudent) {
            setStudentId('');
        }
        setNumPoints(logType === PointType.REWARD ? 10 : 5);
        setCategory('');
        setDescription('');
        setSelectedPresetId('');
    };

    const handleLogAnother = () => {
        resetForm();
        setIsSuccess(false);
        setError(null);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        event.stopPropagation();
        
        const selectedStudent = students.find(s => s.id === studentId);
        if (!selectedStudent || !category || !description) {
            setError("Please fill all required fields.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const signedPoints = logType === PointType.VIOLATION
                ? -Math.abs(numPoints)
                : Math.abs(numPoints);
            
            await addPointLog({
                studentId,
                points: signedPoints,
                type: logType,
                category,
                description,
            });
            onUpdate();
            setIsSuccess(true);
            setLastLoggedStudentName(selectedStudent.name);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center p-4 h-full flex flex-col justify-center items-center">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-secondary" />
                <h3 className="mt-2 text-lg font-medium text-text-primary">Success!</h3>
                <p className="mt-2 text-sm text-text-secondary">Points logged for {lastLoggedStudentName}.</p>
                <Button type="button" onClick={handleLogAnother} className="mt-6" variant="secondary">
                    Log Another
                </Button>
            </div>
        );
    }


    return (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Student</label>
                <SearchableSingleUserSelector
                    users={students}
                    selectedUserId={studentId}
                    onSelectUser={id => { setStudentId(id); setError(null); }}
                    placeholder="Search and select a student..."
                    required
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Select a Preset (Optional)</label>
                <Select value={selectedPresetId} onChange={e => handlePresetChange(e.target.value)}>
                    <option value="">-- Manual Entry --</option>
                    {availablePresets.map((p: any) => (
                        <option key={String(p.id)} value={String(p.id)}>{p.name}</option>
                    ))}
                </Select>
                {availablePresets.length === 0 && (
                    <p className="mt-1 text-xs text-text-secondary">
                        No presets for this type yet. You can still log points manually.
                    </p>
                )}
            </div>
             <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Points</label>
                <Input type="number" min="0" value={numPoints} onChange={e => setNumPoints(Number(e.target.value))} required />
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Category / Keywords</label>
                <Input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g., Homework, Participation" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                <Input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide details..." required />
            </div>
            {error && (
                <p className="text-sm pt-1 text-danger">{error}</p>
            )}
            <Button type="submit" className="w-full !mt-6" disabled={isLoading}>
                {isLoading ? 'Logging...' : 'Log Points'}
            </Button>
        </form>
    );
};
