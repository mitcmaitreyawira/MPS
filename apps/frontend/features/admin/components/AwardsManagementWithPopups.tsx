import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Award, AwardType, AwardStatus, AwardTier, User } from '../../../types';
import * as api from '../../../services/api';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { AwardPopup, AwardDetailPopup, ConfirmationPopup } from '../../../components/ui/AwardPopup';
import { PlusCircleIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, MedalIcon, AwardIcon, availableIconNames } from '../../../assets/icons';
import SearchableSingleUserSelector from '../../shared/SearchableSingleUserSelector';

// Simple icon components for consistency
const FaPlus = PlusCircleIcon;
const FaEdit = PencilIcon;
const FaTrash = TrashIcon;
const FaBan = () => <span>🚫</span>;
const FaSearch = MagnifyingGlassIcon;
const FaFilter = () => <span>🔽</span>;
const FaTrophy = MedalIcon;

const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  // Assuming school year starts in July (month 6)
  return month >= 6 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
};

interface AwardFormData {
  name: string;
  description: string;
  type: AwardType;
  tier: AwardTier;
  icon: string;
  recipientId?: string;
  reason?: string;
  academicYear?: string;
}

/**
 * Enhanced Awards Management component demonstrating the new AwardPopup components
 * This shows how to integrate the reusable popup components with existing functionality
 */
const AwardsManagementWithPopups: React.FC = () => {
  // State management
  const [awards, setAwards] = useState<Award[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [presetAwards, setPresetAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Popup states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAwardDetails, setShowAwardDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);
  const [editingAward, setEditingAward] = useState<Award | null>(null);

  // Form data
  const [formData, setFormData] = useState<AwardFormData>({
    name: '',
    description: '',
    type: AwardType.ACADEMIC,
    tier: AwardTier.BRONZE,
    icon: '🏆',
    recipientId: '',
    reason: '',
    academicYear: getCurrentAcademicYear()
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<AwardType | ''>('');
  const [filterTier, setFilterTier] = useState<AwardTier | ''>('');
  const [filterStatus, setFilterStatus] = useState<AwardStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load data
  useEffect(() => {
    loadAwards();
    loadUsers();
    loadPresetAwards();
  }, []);

  const loadAwards = async () => {
    try {
      setLoading(true);
      const response = await api.getAwards({});
      setAwards(response.awards || []);
    } catch (err) {
      setError('Failed to load awards');
      console.error('Error loading awards:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.getUsers({});
      setUsers(response.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadPresetAwards = async () => {
    try {
      // Fetch awards without recipients (preset awards/templates)
      const response = await api.getAwards({ 
        status: 'pending',
        limit: 100 // Get more preset awards
      });
      setPresetAwards(response.awards || []);
    } catch (err) {
      console.error('Error loading preset awards:', err);
    }
  };

  // Filter and search logic
  const filteredAwards = useMemo(() => {
    return awards.filter(award => {
      const matchesSearch = award.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           award.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !filterType || award.type === filterType;
      const matchesTier = !filterTier || award.tier === filterTier;
      const matchesStatus = !filterStatus || award.status === filterStatus;
      
      return matchesSearch && matchesType && matchesTier && matchesStatus;
    });
  }, [awards, searchTerm, filterType, filterTier, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredAwards.length / itemsPerPage);
  const paginatedAwards = filteredAwards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: AwardType.ACADEMIC,
      tier: AwardTier.BRONZE,
      icon: '🏆',
      recipientId: '', // Always clear recipient selection
      reason: '',
      academicYear: getCurrentAcademicYear()
    });
    // Custom icon state variables removed - using simple text input
  };

  // Enhanced form reset for new award creation
  const resetFormForNewAward = () => {
    setFormData({
      name: '',
      description: '',
      type: AwardType.ACADEMIC,
      tier: AwardTier.BRONZE,
      icon: '🏆',
      recipientId: '', // Explicitly clear recipient for new awards
      reason: '',
      academicYear: getCurrentAcademicYear()
    });
    setEditingAward(null);
    // Custom icon state variables removed - using simple text input
  };

  const handleInputChange = (field: keyof AwardFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Award actions
  const handleCreateAward = async () => {
    try {
      setFormLoading(true);
      await api.createAward(formData);
      // Reset to first page to show the newly created award
      setCurrentPage(1);
      await loadAwards();
      setShowCreateForm(false);
      resetForm();
    } catch (err) {
      setError('Failed to create award');
      console.error('Error creating award:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateAward = async () => {
    if (!editingAward) return;
    
    try {
      setFormLoading(true);
      await api.updateAward(editingAward.id, formData);
      // Reset to first page to show the updated award
      setCurrentPage(1);
      await loadAwards();
      setShowCreateForm(false);
      setEditingAward(null);
      resetForm();
    } catch (err) {
      setError('Failed to update award');
      console.error('Error updating award:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAward = async () => {
    if (!selectedAward) return;
    
    try {
      setFormLoading(true);
      await api.deleteAward(selectedAward.id);
      await loadAwards();
      setShowDeleteConfirm(false);
      setSelectedAward(null);
    } catch (err) {
      setError('Failed to delete award');
      console.error('Error deleting award:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleRevokeAward = async () => {
    if (!selectedAward) return;
    
    try {
      setFormLoading(true);
      await api.revokeAward(selectedAward.id, 'Revoked by administrator');
      await loadAwards();
      setShowRevokeConfirm(false);
      setSelectedAward(null);
    } catch (err) {
      setError('Failed to revoke award');
      console.error('Error revoking award:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // UI event handlers
  const handleViewDetails = (award: Award) => {
    setSelectedAward(award);
    setShowAwardDetails(true);
  };

  const handleEditAward = (award: Award) => {
    setEditingAward(award);
    setFormData({
      name: award.name,
      description: award.description,
      type: award.type,
      tier: award.tier,
      icon: award.icon,
      recipientId: award.recipientId || '',
      reason: award.reason || '',
      academicYear: award.academicYear || getCurrentAcademicYear()
    });
    
    // Icon is now handled directly in formData.icon - no custom state needed
    
    setShowCreateForm(true);
  };

  const handleDeleteClick = (award: Award) => {
    setSelectedAward(award);
    setShowDeleteConfirm(true);
  };

  const handleRevokeClick = (award: Award) => {
    setSelectedAward(award);
    setShowRevokeConfirm(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterTier('');
    setFilterStatus('');
    setCurrentPage(1);
  };

  const getTierColor = (tier: AwardTier) => {
    switch (tier) {
      case AwardTier.BRONZE: return 'text-amber-600';
      case AwardTier.SILVER: return 'text-gray-600';
      case AwardTier.GOLD: return 'text-yellow-600';
      case AwardTier.PLATINUM: return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: AwardStatus) => {
    switch (status) {
      case AwardStatus.ACTIVE: return 'text-green-600 bg-green-50';
      case AwardStatus.REVOKED: return 'text-red-600 bg-red-50';
      case AwardStatus.PENDING: return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const iconOptions = availableIconNames.map(name => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1'),
    value: name
  }));

  // Remove complex icon options - using simple text input instead

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-text-primary">Awards Management (Enhanced)</h3>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={() => setError(null)}
            className="float-right text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Award Creation Actions */}
      <div className="bg-slate-50 rounded-lg border border-border p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-lg font-semibold text-text-primary">Award & Badge Management</h4>
            <p className="text-text-secondary mt-1">Create award templates</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow max-w-md w-full">
            <div className="flex items-center mb-3">
              <MedalIcon className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h5 className="font-semibold text-text-primary">Create Award Template</h5>
                <p className="text-sm text-text-secondary">Create reusable award templates</p>
              </div>
            </div>
            <Button
              onClick={() => {
                resetFormForNewAward();
                setShowCreateForm(true);
              }}
              className="w-full"
              variant="primary"
            >
              <PlusCircleIcon className="w-4 h-4 mr-2" />
              Create Award Template
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search awards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as AwardType | '')}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {Object.values(AwardType).map((type) => (
              <option key={type} value={type}>
                {String(type).charAt(0).toUpperCase() + String(type).slice(1).toLowerCase()}
              </option>
            ))}
          </select>

          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value as AwardTier | '')}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Tiers</option>
            {Object.values(AwardTier).map((tier) => (
              <option key={tier} value={tier}>
                {String(tier).charAt(0).toUpperCase() + String(tier).slice(1).toLowerCase()}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as AwardStatus | '')}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {Object.values(AwardStatus).map((status) => (
              <option key={status} value={status}>
                {String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase()}
              </option>
            ))}
          </select>

          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center space-x-2"
          >
            <FaFilter className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Awards Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : paginatedAwards.length === 0 ? (
          <div className="text-center py-12">
            <FaTrophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No awards found</h3>
            <p className="text-gray-500">Get started by creating your first award.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Award
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Awarded On
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedAwards.map((award) => (
                    <tr key={award.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">{award.icon}</div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{award.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{award.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{award.recipientName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm text-gray-900">
                            {String(award.type).charAt(0).toUpperCase() + String(award.type).slice(1).toLowerCase()}
                          </span>
                          <span className={`text-xs font-medium ${getTierColor(award.tier)}`}>
                            {String(award.tier).charAt(0).toUpperCase() + String(award.tier).slice(1).toLowerCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(award.status)}`}>
                          {String(award.status).charAt(0).toUpperCase() + String(award.status).slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {award.awardedOn ? new Date(award.awardedOn).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetails(award)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleEditAward(award)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                            title="Edit Award"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          {award.status === AwardStatus.ACTIVE && (
                            <button
                              onClick={() => handleRevokeClick(award)}
                              className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                              title="Revoke Award"
                            >
                              <FaBan />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(award)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete Award"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredAwards.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredAwards.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Award Creation Form Popup */}
      <AwardPopup
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          setEditingAward(null);
          resetFormForNewAward();
        }}
        title={editingAward ? 'Edit Award' : 'Create New Award'}
        size="lg"
        actions={[
          {
            label: 'Cancel',
            onClick: () => {
              setShowCreateForm(false);
              setEditingAward(null);
              resetFormForNewAward();
            },
            variant: 'neutral',
            disabled: formLoading
          },
          {
            label: editingAward ? 'Update Award' : 'Create Award',
            onClick: editingAward ? handleUpdateAward : handleCreateAward,
            variant: 'primary',
            loading: formLoading
          }
        ]}
        closeOnOverlayClick={!formLoading}
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); editingAward ? handleUpdateAward() : handleCreateAward(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Award Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter award name"
                disabled={formLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient
              </label>
              <SearchableSingleUserSelector
                selectedUserId={formData.recipientId || ''}
                onSelectUser={(userId) => handleInputChange('recipientId', userId)}
                placeholder="Search and select a recipient (optional)"
                useDatabase={true}
                required={false}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter award description"
              disabled={formLoading}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={formLoading}
              >
                {Object.values(AwardType).map((type) => (
                  <option key={type} value={type}>
                    {String(type).charAt(0).toUpperCase() + String(type).slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tier
              </label>
              <select
                value={formData.tier}
                onChange={(e) => handleInputChange('tier', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={formLoading}
              >
                {Object.values(AwardTier).map((tier) => (
                  <option key={tier} value={tier}>
                    {String(tier).charAt(0).toUpperCase() + String(tier).slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <div className="relative">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{formData.icon}</span>
                  <span className="text-sm text-gray-500">Live Preview</span>
                </div>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                  placeholder="Enter emoji or text (e.g., 🏆, ⭐, 🎯)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-colors"
                  disabled={formLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Choose an emoji or text icon for this award</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => handleInputChange('academicYear', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2024/2025"
                disabled={formLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason (Optional)
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Reason for award"
                disabled={formLoading}
              />
            </div>
          </div>
        </form>
      </AwardPopup>

      {/* Award Details Popup */}
      {selectedAward && (
        <AwardDetailPopup
          isOpen={showAwardDetails}
          onClose={() => {
            setShowAwardDetails(false);
            setSelectedAward(null);
          }}
          award={{
            name: selectedAward.name,
            description: selectedAward.description,
            icon: selectedAward.icon,
            type: selectedAward.type,
            tier: selectedAward.tier,
            recipientName: selectedAward.recipientName,
            awardedOn: selectedAward.awardedOn,
            awardedBy: selectedAward.awardedBy
          }}
          onEdit={() => {
            setShowAwardDetails(false);
            handleEditAward(selectedAward);
          }}
          onDelete={() => {
            setShowAwardDetails(false);
            handleDeleteClick(selectedAward);
          }}
          onRevoke={selectedAward.status === AwardStatus.ACTIVE ? () => {
            setShowAwardDetails(false);
            handleRevokeClick(selectedAward);
          } : undefined}
          isLoading={formLoading}
        />
      )}

      {/* Delete Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedAward(null);
        }}
        title="Confirm Award Deletion"
        message={`Are you sure you want to delete the award "${selectedAward?.name}"? This action cannot be undone and will permanently remove the award from the system.`}
        confirmLabel="Delete Award"
        cancelLabel="Keep Award"
        onConfirm={handleDeleteAward}
        variant="danger"
        isLoading={formLoading}
      />

      {/* Revoke Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showRevokeConfirm}
        onClose={() => {
          setShowRevokeConfirm(false);
          setSelectedAward(null);
        }}
        title="Confirm Award Revocation"
        message={`Are you sure you want to revoke the award "${selectedAward?.name}"? The award will be marked as revoked but will remain in the system for record-keeping purposes.`}
        confirmLabel="Revoke Award"
        cancelLabel="Keep Active"
        onConfirm={handleRevokeAward}
        variant="warning"
        isLoading={formLoading}
      />
    </Card>
  );
};

export default AwardsManagementWithPopups;