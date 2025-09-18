import React, { useState, useCallback } from 'react';
import { User, Class, Award } from '../../../types';
import { AdminSection } from '../../../components/ui/AdminSection';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { TrashIcon, ExclamationTriangleIcon, ShieldExclamationIcon } from '../../../assets/icons';
import { ConfirmationModal } from '../../shared/ConfirmationModal';
import * as api from '../../../services/api';

interface RestrictedAdminSectionProps {
  users: User[];
  classes: Class[];
  awards?: Award[];
  onUpdate: () => void;
}

interface DangerousOperation {
  type: 'delete_user' | 'delete_class' | 'delete_badge' | 'purge_data' | 'reset_points';
  target: string;
  confirmation: string;
}

const RestrictedAdminSection: React.FC<RestrictedAdminSectionProps> = ({
  users,
  classes,
  awards = [],
  onUpdate
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<DangerousOperation | null>(null);
  const [confirmationText, setConfirmationText] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [operationType, setOperationType] = useState<DangerousOperation['type']>('delete_user');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const dangerousOperations = [
    {
      type: 'delete_user' as const,
      label: 'Delete User Permanently',
      description: 'Permanently remove a user and all their data from the system',
      icon: <TrashIcon className="w-5 h-5" />,
      color: 'bg-red-600 hover:bg-red-700',
      confirmationPhrase: 'DELETE USER PERMANENTLY'
    },
    {
      type: 'delete_class' as const,
      label: 'Delete Class',
      description: 'Remove a class and reassign all students',
      icon: <TrashIcon className="w-5 h-5" />,
      color: 'bg-orange-600 hover:bg-orange-700',
      confirmationPhrase: 'DELETE CLASS'
    },
    {
      type: 'delete_badge' as const,
      label: 'Delete Badge',
      description: 'Permanently delete a badge and revoke from all users',
      icon: <ShieldExclamationIcon className="w-5 h-5" />,
      color: 'bg-yellow-600 hover:bg-yellow-700',
      confirmationPhrase: 'DELETE BADGE'
    }
  ];

  const handleOperationSelect = (operation: typeof dangerousOperations[0]) => {
    setOperationType(operation.type);
    setSelectedTarget('');
    setConfirmationText('');
    setError(null);
    setSelectedOperation({
      type: operation.type,
      target: '',
      confirmation: operation.confirmationPhrase
    });
  };

  const getTargetOptions = () => {
    switch (operationType) {
      case 'delete_user':
        return users.map(user => ({
          value: user.id,
          label: `${user.name} (${user.nisn}) - ${user.role}`
        }));
      case 'delete_class':
        return classes.map(cls => ({
          value: cls.id,
          label: `${cls.name} - ${cls.students?.length || 0} students`
        }));
      case 'delete_badge':
        return awards.map(award => ({
          value: award.id,
          label: `${award.title} - ${award.description || 'No description'}`
        }));
      default:
        return [];
    }
  };

  const executeOperation = useCallback(async () => {
    if (!selectedOperation) return;
    
    // Check if target is required for this operation type
    const requiresTarget = ['delete_user', 'delete_class', 'delete_badge'].includes(selectedOperation.type);
    if (requiresTarget && !selectedTarget) return;

    setIsLoading(true);
    setError(null);

    try {
      switch (selectedOperation.type) {
        case 'delete_user':
          await api.deleteUser(selectedTarget);
          break;
        case 'delete_class':
          await api.deleteClass(selectedTarget);
          break;
        case 'delete_badge':
          await api.deleteBadge(selectedTarget);
          break;
           break;
      }

      setSelectedOperation(null);
      setShowConfirmation(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  }, [selectedOperation, selectedTarget, onUpdate]);

  const canExecuteOperation = () => {
    if (!selectedOperation) return false;
    if (selectedOperation.type === 'purge_data' || selectedOperation.type === 'reset_points') {
      return confirmationText === selectedOperation.confirmation;
    }
    return confirmationText === selectedOperation.confirmation && selectedTarget;
  };

  if (!isVisible) {
    return (
      <div className="mt-12 pt-8 border-t-2 border-red-200">
        <div className="text-center">
          <div className="mb-4">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-800">Restricted Operations</h3>
            <p className="text-sm text-gray-600 mb-4">
              Dangerous administrative operations that can cause irreversible damage
            </p>
          </div>
          <Button
            onClick={() => setIsVisible(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            <ShieldExclamationIcon className="w-4 h-4 mr-2" />
            Access Restricted Area
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <AdminSection
        title="⚠️ RESTRICTED OPERATIONS"
        className="border-4 border-red-500 bg-red-50"
      >
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-3" />
            <div>
              <h4 className="text-red-800 font-bold">DANGER ZONE</h4>
              <p className="text-red-700 text-sm">
                These operations are IRREVERSIBLE and can cause permanent data loss.
                Use with extreme caution and ensure you have recent backups.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {dangerousOperations.map((operation) => (
            <button
              key={operation.type}
              onClick={() => handleOperationSelect(operation)}
              className={`p-4 rounded-lg text-white text-left transition-colors ${
                selectedOperation?.type === operation.type
                  ? 'ring-4 ring-yellow-400'
                  : ''
              } ${operation.color}`}
            >
              <div className="flex items-center mb-2">
                {operation.icon}
                <span className="ml-2 font-semibold">{operation.label}</span>
              </div>
              <p className="text-sm opacity-90">{operation.description}</p>
            </button>
          ))}
        </div>

        {selectedOperation && (
          <div className="bg-white border-2 border-red-300 rounded-lg p-6">
            <h4 className="text-lg font-bold text-red-800 mb-4">
              Configure: {dangerousOperations.find(op => op.type === selectedOperation.type)?.label}
            </h4>

            {(selectedOperation.type === 'delete_user' || 
              selectedOperation.type === 'delete_class' || 
              selectedOperation.type === 'delete_badge') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Target:
                </label>
                <Select
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="w-full"
                >
                  <option value="">Choose target...</option>
                  {getTargetOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type "{selectedOperation.confirmation}" to confirm:
              </label>
              <Input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={selectedOperation.confirmation}
                className="w-full font-mono"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmation(true)}
                disabled={!canExecuteOperation() || isLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 disabled:opacity-50"
              >
                {isLoading ? 'Executing...' : 'Execute Operation'}
              </Button>
              <Button
                onClick={() => setSelectedOperation(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-red-300">
          <Button
            onClick={() => setIsVisible(false)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2"
          >
            Hide Restricted Area
          </Button>
        </div>
      </AdminSection>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={executeOperation}
        title="Final Confirmation"
        message={`Are you absolutely sure you want to execute this dangerous operation? This action cannot be undone.`}
        confirmText="Execute"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default RestrictedAdminSection;