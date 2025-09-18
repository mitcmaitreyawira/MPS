

import React, { useState, useMemo } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useData } from '../../context/DataContext';
import { UserRole } from '../../types';
import SearchableSingleUserSelector from './SearchableSingleUserSelector';
import { FlagIcon, CheckCircleIcon } from '../../assets/icons';

const ReportTeacherModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { users, submitTeacherReport } = useData();
    const [targetTeacherId, setTargetTeacherId] = useState('');
    const [details, setDetails] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

    const teachers = useMemo(() => {
        return users.filter(u => {
            // Check roles array first (new format)
            if (Array.isArray(u.roles)) {
                return u.roles.some(role => 
                    role === 'teacher' || role === 'head_teacher' || role === 'head_of_class'
                );
            }
            // Fallback to single role property (backward compatibility)
            if (u.role) {
                return u.role === UserRole.TEACHER || u.role === UserRole.HEAD_OF_CLASS;
            }
            return false;
        });
    }, [users]);

    const resetAndClose = () => {
        setTargetTeacherId('');
        setDetails('');
        setIsAnonymous(false);
        setIsSubmitting(false);
        setFeedback(null);
        onClose();
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setFeedback(null);
        if (!targetTeacherId || !details) {
            setFeedback({type: 'error', message: 'Please select a teacher and provide details.'});
            return;
        }
        setIsSubmitting(true);
        try {
            await submitTeacherReport({ targetTeacherId, details, isAnonymous });
            setFeedback({type: 'success', message: 'Report submitted successfully.'});
        } catch (error) {
            setFeedback({type: 'error', message: (error as Error).message});
            setIsSubmitting(false);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={resetAndClose} title={feedback?.type === 'success' ? 'Success' : "Report an Issue"}>
             {feedback?.type === 'success' ? (
                <div className="text-center py-4">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-secondary" />
                    <h3 className="mt-2 text-lg font-medium text-text-primary">Report Submitted</h3>
                    <p className="mt-2 text-sm text-text-secondary">{feedback.message}</p>
                    <Button onClick={resetAndClose} className="mt-6" variant="secondary">
                        Close
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="teacher" className="block text-sm font-medium text-text-secondary mb-1">Teacher to Report</label>
                        <SearchableSingleUserSelector
                            users={teachers}
                            selectedUserId={targetTeacherId}
                            onSelectUser={setTargetTeacherId}
                            placeholder="Search for a teacher..."
                            required
                        />
                    </div>
                    <div>
                         <label htmlFor="details" className="block text-sm font-medium text-text-secondary mb-1">Details of the Incident</label>
                         <textarea
                            id="details"
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            required
                            rows={5}
                            className="shadow-sm appearance-none border border-border rounded-lg w-full py-2 px-3 bg-surface text-text-primary placeholder-text-secondary/70 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Please provide a clear and detailed description of the event. Include date, time, and location if possible."
                         />
                    </div>
                     <label className="flex items-center space-x-3 cursor-pointer text-text-secondary">
                        <input type="checkbox" name="isAnonymous" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                        <span>Submit Anonymously</span>
                    </label>
                    {isAnonymous && <p className="text-xs text-amber-700 bg-amber-100 p-2 rounded-md">If you submit anonymously, we cannot contact you for follow-up questions. Please be as detailed as possible.</p>}
                    
                    {feedback?.type === 'error' && (
                        <div className={`mt-4 text-sm p-3 rounded-lg bg-red-100 text-red-800`}>
                            {feedback.message}
                        </div>
                    )}

                    <div className="pt-4 flex justify-end space-x-2">
                        <Button type="button" variant="neutral" onClick={resetAndClose}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Report'}</Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};


const ReportTeacherFooter: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <footer className="py-8 mt-8 border-t border-border">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="max-w-xl">
                        <h4 className="font-semibold text-text-primary">Confidential Reporting Channel</h4>
                        <p className="text-sm text-text-secondary mt-1">
                            For serious concerns only. Your report will be sent directly to an administrator for review. Please use this feature responsibly.
                        </p>
                    </div>
                    <Button 
                        onClick={() => setIsModalOpen(true)} 
                        variant="danger-ghost"
                        className="flex-shrink-0"
                    >
                         <FlagIcon className="h-4 w-4 mr-2"/>
                        Report an Issue
                    </Button>
                </div>
            </footer>
            <ReportTeacherModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};

export default ReportTeacherFooter;
