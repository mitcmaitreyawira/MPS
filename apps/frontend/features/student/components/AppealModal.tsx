

import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Appeal } from '../../../types';
import { CheckCircleIcon } from '../../../assets/icons';

interface AppealModalProps {
    isOpen: boolean;
    onClose: () => void;
    pointLogId: string;
    onSubmitAppeal: (appeal: Pick<Appeal, 'pointLogId' | 'reason'>) => Promise<void>;
}

export const AppealModal: React.FC<AppealModalProps> = ({ isOpen, onClose, pointLogId, onSubmitAppeal }) => {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    
    const handleClose = () => {
        setReason('');
        setFeedback(null);
        setIsSubmitting(false);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            setFeedback({ type: 'error', message: 'Please provide a reason for your appeal.' });
            return;
        }
        setIsSubmitting(true);
        setFeedback(null);
        try {
            await onSubmitAppeal({
                pointLogId,
                reason
            });
            setFeedback({ type: 'success', message: 'Your appeal has been submitted successfully.'});
        } catch (error) {
            setFeedback({ type: 'error', message: (error as Error).message});
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={feedback?.type === 'success' ? 'Success' : "Submit an Appeal"}>
            {feedback?.type === 'success' ? (
                <div className="text-center py-4">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-secondary" />
                    <h3 className="mt-2 text-lg font-medium text-text-primary">Appeal Submitted</h3>
                    <p className="mt-2 text-sm text-text-secondary">{feedback.message}</p>
                    <Button onClick={handleClose} className="mt-6" variant="secondary">
                        Close
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-text-secondary mb-1">
                            Reason for Appeal
                        </label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            required
                            rows={5}
                            className="shadow-sm appearance-none border border-border rounded-lg w-full py-2 px-3 bg-surface text-text-primary placeholder-text-secondary/70 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Please clearly and respectfully explain why you believe the point deduction was incorrect or should be reconsidered."
                        />
                         <p className="text-xs text-text-secondary mt-2">Your appeal will be sent to an administrator for review. Please be patient.</p>
                    </div>

                    {feedback?.type === 'error' && (
                        <div className="text-sm p-3 rounded-lg bg-red-100 text-red-800">
                            {feedback.message}
                        </div>
                    )}

                    <div className="pt-4 flex justify-end space-x-2">
                        <Button type="button" variant="neutral" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Appeal'}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};
