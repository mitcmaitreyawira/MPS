import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from './Button';
import { XCircleIcon } from '../../assets/icons';

interface AwardPopupAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'neutral' | 'danger-ghost';
  disabled?: boolean;
  loading?: boolean;
}

interface AwardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: AwardPopupAction[];
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

export const AwardPopup: React.FC<AwardPopupProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions = [],
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
    >
      <div 
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 
            id="popup-title" 
            className="text-xl font-semibold text-gray-900"
          >
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100"
              aria-label="Close popup"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || 'primary'}
                disabled={action.disabled || action.loading}
                className={action.loading ? 'opacity-75 cursor-not-allowed' : ''}
              >
                {action.loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                )}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// Specialized Award Detail Popup
interface AwardDetailPopupProps {
  isOpen: boolean;
  onClose: () => void;
  award: {
    name: string;
    description: string;
    icon: string;
    type: string;
    tier: string;
    recipientName?: string;
    awardedOn?: string;
    awardedBy?: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onRevoke?: () => void;
  isLoading?: boolean;
}

export const AwardDetailPopup: React.FC<AwardDetailPopupProps> = ({
  isOpen,
  onClose,
  award,
  onEdit,
  onDelete,
  onRevoke,
  isLoading = false
}) => {
  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return 'text-amber-600 bg-amber-50';
      case 'silver': return 'text-gray-600 bg-gray-50';
      case 'gold': return 'text-yellow-600 bg-yellow-50';
      case 'platinum': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'academic': return 'text-blue-600 bg-blue-50';
      case 'behavior': return 'text-green-600 bg-green-50';
      case 'participation': return 'text-orange-600 bg-orange-50';
      case 'leadership': return 'text-purple-600 bg-purple-50';
      case 'community_service': return 'text-teal-600 bg-teal-50';
      case 'special_achievement': return 'text-pink-600 bg-pink-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const actions: AwardPopupAction[] = [];
  
  if (onEdit) {
    actions.push({
      label: 'Edit',
      onClick: onEdit,
      variant: 'secondary',
      disabled: isLoading
    });
  }
  
  if (onRevoke) {
    actions.push({
      label: 'Revoke',
      onClick: onRevoke,
      variant: 'danger-ghost',
      disabled: isLoading
    });
  }
  
  if (onDelete) {
    actions.push({
      label: 'Delete',
      onClick: onDelete,
      variant: 'danger',
      disabled: isLoading
    });
  }

  return (
    <AwardPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Award Details"
      actions={actions}
      size="md"
    >
      <div className="space-y-6">
        {/* Award Header */}
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{award.icon}</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900">{award.name}</h3>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTierColor(award.tier)}`}>
                {award.tier.charAt(0).toUpperCase() + award.tier.slice(1)}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(award.type)}`}>
                {award.type.replace('_', ' ').charAt(0).toUpperCase() + award.type.replace('_', ' ').slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Award Description */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
          <p className="text-gray-600 leading-relaxed">{award.description}</p>
        </div>

        {/* Award Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {award.recipientName && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Recipient</h4>
              <p className="text-gray-900">{award.recipientName}</p>
            </div>
          )}
          {award.awardedOn && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Awarded On</h4>
              <p className="text-gray-900">{new Date(award.awardedOn).toLocaleDateString()}</p>
            </div>
          )}
          {award.awardedBy && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Awarded By</h4>
              <p className="text-gray-900">{award.awardedBy}</p>
            </div>
          )}
        </div>
      </div>
    </AwardPopup>
  );
};

// Confirmation Popup
interface ConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'info',
  isLoading = false
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: '⚠️',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          icon: '⚠️',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        };
      default:
        return {
          icon: 'ℹ️',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        };
    }
  };

  const variantStyles = getVariantStyles();
  const confirmVariant = variant === 'danger' ? 'danger' : 'primary';

  const actions: AwardPopupAction[] = [
    {
      label: cancelLabel,
      onClick: onClose,
      variant: 'neutral',
      disabled: isLoading
    },
    {
      label: confirmLabel,
      onClick: onConfirm,
      variant: confirmVariant,
      loading: isLoading
    }
  ];

  return (
    <AwardPopup
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={actions}
      size="sm"
      closeOnOverlayClick={!isLoading}
    >
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${variantStyles.iconBg} flex items-center justify-center`}>
          <span className={`text-lg ${variantStyles.iconColor}`}>{variantStyles.icon}</span>
        </div>
        <div className="flex-1">
          <p className="text-gray-700 leading-relaxed">{message}</p>
        </div>
      </div>
    </AwardPopup>
  );
};