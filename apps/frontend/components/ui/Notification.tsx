import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, BellIcon, TrashIcon } from '../../assets/icons';
import { designTokens } from './DesignTokens';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: React.ReactNode;
  maxNotifications?: number;
}

export function NotificationProvider({ children, maxNotifications = 5 }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? (notification.persistent ? undefined : 5000),
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, maxNotifications);
      return updated;
    });

    // Auto-remove after duration
    if (newNotification.duration && !newNotification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, [maxNotifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll,
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

function NotificationContainer() {
  const { notifications } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map(notification => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
}

function NotificationItem({ notification }: NotificationItemProps) {
  const { removeNotification } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  React.useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      removeNotification(notification.id);
    }, 300);
  };

  const typeConfig = {
    success: {
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700',
    },
    error: {
      icon: XCircleIcon,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700',
    },
    info: {
      icon: BellIcon,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700',
    },
  };

  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${config.bgColor} ${config.borderColor}
        border rounded-lg shadow-lg p-4 max-w-sm w-full
      `}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${config.titleColor}`}>
            {notification.title}
          </h4>
          {notification.message && (
            <p className={`mt-1 text-sm ${config.messageColor}`}>
              {notification.message}
            </p>
          )}
          {notification.action && (
            <div className="mt-3">
              <button
                onClick={notification.action.onClick}
                className={`text-sm font-medium ${config.iconColor} hover:underline`}
              >
                {notification.action.label}
              </button>
            </div>
          )}
        </div>
        
        <div className="flex-shrink-0">
          <button
            onClick={handleRemove}
            className={`${config.iconColor} hover:opacity-75 transition-opacity`}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Utility hooks for common notification types
export function useNotificationHelpers() {
  const { addNotification } = useNotifications();

  const showSuccess = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'success', title, message, ...options });
  }, [addNotification]);

  const showError = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'error', title, message, persistent: true, ...options });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'warning', title, message, ...options });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({ type: 'info', title, message, ...options });
  }, [addNotification]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}

// Inline notification component for forms and sections
interface InlineNotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function InlineNotification({
  type,
  title,
  message,
  onClose,
  className = '',
  action,
}: InlineNotificationProps) {
  const typeConfig = {
    success: {
      icon: CheckCircleIcon,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700',
    },
    error: {
      icon: XCircleIcon,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700',
    },
    info: {
      icon: BellIcon,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium ${config.titleColor}`}>
            {title}
          </h4>
          {message && (
            <p className={`mt-1 text-sm ${config.messageColor}`}>
              {message}
            </p>
          )}
          {action && (
            <div className="mt-3">
              <button
                onClick={action.onClick}
                className={`text-sm font-medium ${config.iconColor} hover:underline`}
              >
                {action.label}
              </button>
            </div>
          )}
        </div>
        
        {onClose && (
          <div className="flex-shrink-0">
            <button
              onClick={onClose}
              className={`${config.iconColor} hover:opacity-75 transition-opacity`}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationProvider;