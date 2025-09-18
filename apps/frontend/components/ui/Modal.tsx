
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { XCircleIcon } from '../../assets/icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: 'max-w-sm sm:max-w-md',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-xl lg:max-w-2xl',
    xl: 'max-w-xl sm:max-w-2xl lg:max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({ 
    isOpen, 
    onClose, 
    title, 
    children,
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    className = ''
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Handle escape key
    useEffect(() => {
        if (!isOpen || !closeOnEscape) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeOnEscape, onClose]);

    // Handle focus management
    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement as HTMLElement;
            
            // Focus the modal after a brief delay
            const timer = setTimeout(() => {
                modalRef.current?.focus();
            }, 100);
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            return () => {
                clearTimeout(timer);
                document.body.style.overflow = 'unset';
            };
        } else {
            // Return focus to the previously active element
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
        }
    }, [isOpen]);

    // Handle focus trap
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start sm:items-center p-2 sm:p-4 transition-opacity duration-300 overflow-y-auto" 
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            <div 
                ref={modalRef}
                className={`bg-surface rounded-lg sm:rounded-xl shadow-xl w-full ${sizeClasses[size]} mx-auto border border-border transform transition-all duration-300 scale-100 my-2 sm:my-0 ${className}`} 
                onClick={e => e.stopPropagation()}
                tabIndex={-1}
                onKeyDown={handleKeyDown}
            >
                {(title || showCloseButton) && (
                    <div className="flex justify-between items-center p-4 sm:p-5 border-b border-border">
                        {title && (
                            <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-text-primary pr-2">{title}</h2>
                        )}
                        {showCloseButton && (
                            <button 
                                onClick={onClose} 
                                className="p-1 sm:p-2 text-text-secondary hover:text-text-primary hover:bg-gray-100 rounded-full transition-colors flex-shrink-0" 
                                aria-label="Close modal"
                            >
                                <XCircleIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                )}
                <div className="p-4 sm:p-6">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

// Hook for modal state management
export function useModal(initialState = false) {
    const [isOpen, setIsOpen] = React.useState(initialState);

    const open = React.useCallback(() => setIsOpen(true), []);
    const close = React.useCallback(() => setIsOpen(false), []);
    const toggle = React.useCallback(() => setIsOpen(prev => !prev), []);

    return {
        isOpen,
        open,
        close,
        toggle,
    };
}
