

import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>; // Make async required
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    confirmVariant?: 'primary' | 'secondary' | 'danger' | 'neutral';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    confirmVariant = 'danger'
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset internal state when the modal is opened/closed from the parent
    useEffect(() => {
        if (!isOpen) {
            setIsLoading(false);
            setError(null);
        }
    }, [isOpen]);

    const handleConfirm = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await onConfirm();
            // The parent is responsible for closing the modal on success.
            // This is typically done in the same function passed to onConfirm.
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // The handleClose function now simply calls the parent's onClose.
    // It prevents closing while an action is in progress.
    const handleClose = () => {
        if (isLoading) return;
        onClose();
    };


    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={title}>
            <div className="text-text-secondary mb-6">{message}</div>
            
            {error && (
                <div className="mb-4 text-sm p-3 rounded-lg bg-red-100 text-red-800">
                    {error}
                </div>
            )}

            <div className="flex justify-end space-x-3">
                <Button variant="neutral" onClick={handleClose} disabled={isLoading}>Cancel</Button>
                <Button variant={confirmVariant} onClick={handleConfirm} disabled={isLoading}>
                    {isLoading ? 'Processing...' : confirmText}
                </Button>
            </div>
        </Modal>
    );
};
