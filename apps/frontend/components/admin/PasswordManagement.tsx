import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import * as api from '../../services/api';

interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  specialChars: string;
}

interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

interface PasswordManagementProps {
  users: User[];
  onPasswordChanged?: (userId: string) => void;
}

export const PasswordManagement: React.FC<PasswordManagementProps> = ({
  users,
  onPasswordChanged
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [reason, setReason] = useState('');
  const [policy, setPolicy] = useState<PasswordPolicy | null>(null);
  const [validation, setValidation] = useState<PasswordValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPasswordPolicy();
  }, []);

  useEffect(() => {
    if (newPassword && policy) {
      validatePassword();
    }
  }, [newPassword, selectedUser]);

  const loadPasswordPolicy = async () => {
    try {
      const response = await api.getPasswordPolicy();
      setPolicy(response.data);
    } catch (error) {
      console.error('Failed to load password policy:', error);
    }
  };

  const validatePassword = async () => {
    if (!newPassword) {
      setValidation(null);
      return;
    }

    try {
      const response = await api.validatePassword(newPassword, selectedUser?.id);
      setValidation(response.data);
    } catch (error) {
      console.error('Password validation failed:', error);
    }
  };

  const generateSecurePassword = async () => {
    try {
      setLoading(true);
      const response = await api.generateSecurePassword(16);
      setNewPassword(response.data.password);
      setMessage({ type: 'success', text: 'Secure password generated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to generate password' });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!selectedUser || !newPassword || !validation?.isValid) {
      return;
    }

    try {
      setLoading(true);
      await api.changeUserPassword(selectedUser.id, newPassword, reason);
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setNewPassword('');
      setReason('');
      setSelectedUser(null);
      setValidation(null);
      onPasswordChanged?.(selectedUser.id);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'weak': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStrengthBg = (strength: string) => {
    switch (strength) {
      case 'strong': return 'bg-green-100 border-green-300';
      case 'medium': return 'bg-yellow-100 border-yellow-300';
      case 'weak': return 'bg-red-100 border-red-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Password Management</h2>

      {message && (
        <div className={`mb-4 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {message.text}
          <button 
            onClick={() => setMessage(null)}
            className="ml-2 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* User Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select User
        </label>
        <select
          value={selectedUser?.id || ''}
          onChange={(e) => {
            const user = users.find(u => u.id === e.target.value);
            setSelectedUser(user || null);
            setNewPassword('');
            setValidation(null);
          }}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option key="choose" value="">Choose a user...</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email}) - {user.role}
            </option>
          ))}
        </select>
      </div>

      {selectedUser && (
        <>
          {/* Selected User Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-800 mb-2">Selected User</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Name:</strong> {selectedUser.name}</div>
              <div><strong>Email:</strong> {selectedUser.email}</div>
              <div><strong>Role:</strong> {selectedUser.role}</div>
              <div><strong>NISN:</strong> {selectedUser.nisn || 'N/A'}</div>
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent pr-20"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={generateSecurePassword}
                disabled={loading}
                className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 disabled:opacity-50"
              >
                Generate Secure Password
              </button>
            </div>
          </div>

          {/* Password Acceptance Display */}
          {newPassword && (
            <div className="mb-4 p-4 bg-green-50 rounded-md border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-green-700">Password Status:</span>
                <span className="font-bold text-green-600">
                  Accepted
                </span>
              </div>
              <p className="text-sm text-green-600">✓ Any password is accepted - no requirements</p>
            </div>
          )}

          {/* Password Policy Display */}
          <div className="mb-4 p-4 bg-green-50 rounded-md border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Password Policy</h4>
            <p className="text-sm text-green-700">
              ✓ No password requirements - any input is accepted
            </p>
          </div>

          {/* Reason Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Password Change (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              placeholder="Enter reason for password change (for audit log)"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={changePassword}
              disabled={loading || !newPassword}
              className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
            
            <button
              onClick={() => {
                setSelectedUser(null);
                setNewPassword('');
                setReason('');
                setValidation(null);
                setMessage(null);
              }}
              className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
};
