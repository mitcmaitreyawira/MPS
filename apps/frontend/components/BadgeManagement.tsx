import React, { useState } from 'react';
import { PointLog, BadgeTier } from '../types';
import { useData } from '../context/DataContext';
import { BadgeIconRenderer } from '../features/shared/BadgeIconRenderer';

interface BadgeManagementProps {
  pointLog: PointLog;
  onUpdate?: (updatedPointLog: PointLog) => void;
  onDelete?: (pointLogId: string) => void;
  showActions?: boolean;
}

const BadgeManagement: React.FC<BadgeManagementProps> = ({
  pointLog,
  onUpdate,
  onDelete,
  showActions = true
}) => {
  const { updatePointLog, deletePointLog } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    tier: pointLog.badge?.tier || BadgeTier.BRONZE,
    reason: pointLog.badge?.reason || '',
    icon: pointLog.badge?.icon || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      tier: pointLog.badge?.tier || BadgeTier.BRONZE,
      reason: pointLog.badge?.reason || '',
      icon: pointLog.badge?.icon || ''
    });
    setError(null);
  };

  const handleSave = async () => {
    if (!editForm.reason.trim()) {
      setError('Badge reason is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedPointLog = await updatePointLog(pointLog.id, {
        badge: {
          id: pointLog.badge?.id || '',
          tier: editForm.tier,
          reason: editForm.reason.trim(),
          icon: editForm.icon.trim() || undefined,
          awardedBy: pointLog.badge?.awardedBy || '',
          awardedOn: pointLog.badge?.awardedOn || new Date()
        }
      });

      setIsEditing(false);
      onUpdate?.(updatedPointLog);
    } catch (err: any) {
      setError(err.message || 'Failed to update badge');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this badge? This will remove the entire point log entry.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await deletePointLog(pointLog.id);
      onDelete?.(pointLog.id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete badge');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBadge = async () => {
    if (!confirm('Are you sure you want to remove the badge from this point log?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedPointLog = await updatePointLog(pointLog.id, {
        badge: null
      });

      onUpdate?.(updatedPointLog);
    } catch (err: any) {
      setError(err.message || 'Failed to remove badge');
    } finally {
      setIsLoading(false);
    }
  };

  if (!pointLog.badge) {
    return (
      <div className="text-gray-500 text-sm">
        No badge associated with this point log
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <BadgeIconRenderer 
            badge={{ tier: pointLog.badge.tier, icon: pointLog.badge.icon }} 
            className="h-8 w-8" 
          />
          <div>
            <h4 className="font-medium text-gray-900">
              {pointLog.badge.tier.charAt(0).toUpperCase() + pointLog.badge.tier.slice(1)} Badge
            </h4>
            <p className="text-sm text-gray-600">{pointLog.badge.reason}</p>
            {pointLog.badge.icon && (
              <p className="text-xs text-gray-500">Icon: {pointLog.badge.icon}</p>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              disabled={isLoading || isEditing}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
            >
              Edit
            </button>
            <button
              onClick={handleRemoveBadge}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 disabled:opacity-50"
            >
              Remove Badge
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
            >
              Delete Entry
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {isEditing && (
        <div className="space-y-3 border-t pt-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Badge Tier
            </label>
            <select
              value={editForm.tier}
              onChange={(e) => setEditForm(prev => ({ ...prev, tier: e.target.value as BadgeTier }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option key={BadgeTier.BRONZE} value={BadgeTier.BRONZE}>Bronze</option>
                <option key={BadgeTier.SILVER} value={BadgeTier.SILVER}>Silver</option>
                <option key={BadgeTier.GOLD} value={BadgeTier.GOLD}>Gold</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Badge Reason *
            </label>
            <input
              type="text"
              value={editForm.reason}
              onChange={(e) => setEditForm(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter badge reason"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Badge Icon (optional)
            </label>
            <input
              type="text"
              value={editForm.icon}
              onChange={(e) => setEditForm(prev => ({ ...prev, icon: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter icon name or emoji"
              disabled={isLoading}
            />
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              onClick={handleSave}
              disabled={isLoading || !editForm.reason.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
        <p>Point Log ID: {pointLog.id}</p>
        <p>Points: {pointLog.points} | Category: {pointLog.category}</p>
        {pointLog.description && <p>Description: {pointLog.description}</p>}
      </div>
    </div>
  );
};

export default BadgeManagement;