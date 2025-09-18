import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, BellIcon, TrashIcon } from '../../assets/icons';
import { designTokens } from './DesignTokens';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getToastStyles = () => {
    const baseStyles = 'rounded-lg shadow-lg border p-4 transition-all duration-300 transform';
    const animationStyles = isLeaving 
      ? 'translate-x-full opacity-0' 
      : isVisible 
        ? 'translate-x-0 opacity-100' 
        : 'translate-x-full opacity-0';

    const typeStyles = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    return `${baseStyles} ${animationStyles} ${typeStyles[toast.type]}`;
  };

  const getIcon = () => {
    const iconProps = { className: 'h-5 w-5 flex-shrink-0' };
    
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon {...iconProps} className={`${iconProps.className} text-green-500`} />;
      case 'error':
        return <XCircleIcon {...iconProps} className={`${iconProps.className} text-red-500`} />;
      case 'warning':
        return <ExclamationTriangleIcon {...iconProps} className={`${iconProps.className} text-yellow-500`} />;
      case 'info':
        return <BellIcon {...iconProps} className={`${iconProps.className} text-blue-500`} />;
      default:
        return null;
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{toast.title}</p>
          {toast.message && (
            <p className="mt-1 text-sm opacity-90">{toast.message}</p>
          )}
          {toast.action && (
            <div className="mt-2">
              <button
                onClick={toast.action.onClick}
                className="text-sm font-medium underline hover:no-underline focus:outline-none"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleRemove}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
          >
            <XCircleIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Utility functions for common toast patterns
export const showSuccessToast = (addToast: ToastContextType['addToast']) => (title: string, message?: string) => {
  addToast({ type: 'success', title, message });
};

export const showErrorToast = (addToast: ToastContextType['addToast']) => (title: string, message?: string) => {
  addToast({ type: 'error', title, message, duration: 7000 });
};

export const showWarningToast = (addToast: ToastContextType['addToast']) => (title: string, message?: string) => {
  addToast({ type: 'warning', title, message });
};

export const showInfoToast = (addToast: ToastContextType['addToast']) => (title: string, message?: string) => {
  addToast({ type: 'info', title, message });
};

export default ToastProvider;