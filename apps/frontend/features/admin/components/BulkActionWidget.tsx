

import React, { useState, useMemo } from 'react';
import { Card } from '../../../components/ui/Card';
import { useData } from '../../../context/DataContext';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { SparklesIcon, CheckCircleIcon } from '../../../assets/icons';
import { ActionType } from '../../../types';

export const BulkActionWidget: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const { classes, actionPresets, addBulkAction } = useData();
    const [action, setAction] = useState<'points' | 'badge'>('points');
    const [classId, setClassId] = useState('');
    const [points, setPoints] = useState(10);
    const [reason, setReason] = useState('');
    const [presetId, setPresetId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const medalPresets = useMemo(() => {
        return Array.isArray(actionPresets) ? actionPresets.filter(p => p.type === ActionType.MEDAL && !p.isArchived) : [];
    }, [actionPresets]);

    const resetForm = () => {
        setClassId(classes.length > 0 ? classes[0].id : '');
        setPoints(10);
        setReason('');
        setPresetId('');
    };
    
    const handleDoAnother = () => {
        resetForm();
        setError(null);
        setIsSuccess(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!classId) {
            setError("Please select a class.");
            return;
        }

        let actionPayload;
        if (action === 'points') {
            if (!reason) {
                setError("Please provide a reason for the points.");
                return;
            }
            actionPayload = { type: 'points' as const, points, category: 'Bulk Action', description: reason };
        } else {
            if (!presetId) {
                setError("Please select a medal preset.");
                return;
            }
            actionPayload = { type: 'badge' as const, presetId };
        }
        
        setIsLoading(true);
        try {
            await addBulkAction(classId, actionPayload);
            onUpdate();
            setIsSuccess(true);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isSuccess) {
        return (
            <Card>
                <div className="text-center p-4 h-full flex flex-col justify-center items-center">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-secondary" />
                    <h3 className="mt-2 text-lg font-medium text-text-primary">Success!</h3>
                    <p className="mt-2 text-sm text-text-secondary">Bulk action completed successfully.</p>
                    <Button onClick={handleDoAnother} className="mt-6" variant="secondary">
                        Perform Another Action
                    </Button>
                </div>
            </Card>
        )
    }

    return (
        <Card>
            <h3 className="text-xl font-semibold text-text-primary flex items-center gap-3 mb-4">
                <SparklesIcon className="h-6 w-6" />
                Bulk Action Tool
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">Select Action Type</label>
                    <Select value={action} onChange={e => setAction(e.target.value as 'points' | 'badge')}>
                        <option value="points">Award Points</option>
                        <option value="badge">Award Badge</option>
                    </Select>
                </div>
                
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1">Target Class</label>
                    <Select value={classId} onChange={e => setClassId(e.target.value)} required>
                        <option value="" disabled>-- Select a class --</option>
                        {Array.isArray(classes) ? classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>) : []}
                    </Select>
                </div>
                
                {action === 'points' ? (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Points to Award</label>
                            <Input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Reason</label>
                            <Input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g., School fair participation" required />
                        </div>
                    </>
                ) : (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Medal Preset</label>
                        <Select value={presetId} onChange={e => setPresetId(e.target.value)} required>
                            <option value="" disabled>-- Select a badge --</option>
                            {medalPresets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </Select>
                    </div>
                )}

                {error && <p className={`md:col-span-2 text-sm text-danger`}>{error}</p>}
                
                <div className="md:col-span-2">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Apply Bulk Action'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};
