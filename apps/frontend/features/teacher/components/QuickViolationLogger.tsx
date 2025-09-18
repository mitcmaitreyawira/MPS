

import React, { useState, useMemo } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { User, ActionType, PointType, ActionPreset } from '../../../types';
import { useData } from '../../../context/DataContext';
import { CheckCircleIcon, ShieldExclamationIcon } from '../../../assets/icons';

interface QuickViolationLoggerProps {
    student: User | null;
    onClose: () => void;
}

export const QuickViolationLogger: React.FC<QuickViolationLoggerProps> = ({ student, onClose }) => {
    const { actionPresets, addPointLog } = useData();
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const violationPresets = useMemo(() => {
        return actionPresets.filter(p => p.type === ActionType.VIOLATION && !p.isArchived);
    }, [actionPresets]);

    const handleClose = () => {
        if (isLoading) return;
        setIsLoading(false);
        setFeedback(null);
        onClose();
    };

    const handleLogViolation = async (preset: ActionPreset) => {
        if (!student || isLoading) return;
        setIsLoading(true);
        setFeedback(null);
        try {
            await addPointLog({
                studentId: student.id,
                points: preset.points, // Points are already negative for violations
                type: PointType.VIOLATION,
                category: preset.category,
                description: preset.description,
            });
            setFeedback({ type: 'success', message: `Violation logged for ${student.name}.`});
        } catch (error) {
            setFeedback({ type: 'error', message: (error as Error).message });
        } finally {
            setIsLoading(false);
        }
    };

    if (!student) return null;

    return (
        <Modal isOpen={!!student} onClose={handleClose} title={feedback?.type === 'success' ? 'Success' : `Log Violation for ${student.name}`}>
            {feedback?.type === 'success' ? (
                <div className="text-center py-4">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-secondary" />
                    <h3 className="mt-2 text-lg font-medium text-text-primary">Violation Logged</h3>
                    <p className="mt-2 text-sm text-text-secondary">{feedback.message}</p>
                    <Button onClick={handleClose} className="mt-6" variant="secondary">
                        Close
                    </Button>
                </div>
            ) : (
                <div>
                    <p className="text-text-secondary mb-4">Select a common violation to quickly log points.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {violationPresets.map(preset => (
                            <Button
                                key={preset.id}
                                onClick={() => handleLogViolation(preset)}
                                disabled={isLoading}
                                variant="danger-ghost"
                                className="!font-normal justify-start text-left h-auto py-3"
                            >
                                <div className="flex flex-col">
                                    <span className="font-semibold">{preset.name}</span>
                                    <span className="text-xs">{preset.points} points</span>
                                </div>
                            </Button>
                        ))}
                    </div>
                    {violationPresets.length === 0 && (
                        <div className="text-center py-8 text-text-secondary">
                            <ShieldExclamationIcon className="h-8 w-8 mx-auto mb-2" />
                            <p>No violation presets have been configured by the administrator.</p>
                        </div>
                    )}
                     {feedback?.type === 'error' && (
                        <div className={`mt-4 text-sm p-3 rounded-lg bg-red-100 text-red-800`}>
                            {feedback.message}
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};
