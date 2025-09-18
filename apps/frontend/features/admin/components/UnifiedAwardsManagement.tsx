import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AdminSection, ActionBar, FilterSection } from '../../../components/ui/AdminSection';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { DataTable } from '../../../components/ui/DataTable';
import { User, PointType, BadgeTier, UserRole, AwardType, AwardTier, Award, AwardStatus, PointLog } from '../../../types';
import { useData } from '../../../context/DataContext';

import { 
  GoldMedalIcon, 
  CheckCircleIcon, 
  PlusCircleIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon, 
  MedalIcon,
  AwardIcon,
  availableIconNames
} from '../../../assets/icons';
import SearchableSingleUserSelector from '../../shared/SearchableSingleUserSelector';

import * as api from '../../../services/api';

interface AwardFormData {
  name: string;
  description: string;
  type: AwardType;
  tier: AwardTier;
  icon: string;
  recipientId?: string;
  reason?: string;
}

interface UnifiedAwardsManagementProps {
  onUpdate: () => void;
}

type TabType = 'quick-award' | 'manage-templates' | 'assign-templates';



export const UnifiedAwardsManagement: React.FC<UnifiedAwardsManagementProps> = ({ onUpdate }) => {
  const { users, classes, loading, addPointLog } = useData();
  

  
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('quick-award');
  

  
  // Quick Award states (from DirectAwardWidget)
  const [studentId, setStudentId] = useState('');
  const [points, setPoints] = useState(25);
  const [badgeTier, setBadgeTier] = useState<BadgeTier>(BadgeTier.BRONZE);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastAwardedStudentName, setLastAwardedStudentName] = useState('');
  const [createFormalAward, setCreateFormalAward] = useState(false);
  const [awardType, setAwardType] = useState<AwardType>(AwardType.ACADEMIC);
  const [usePresetAward, setUsePresetAward] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  
  // Template Management states (from AwardsManagement)
  const [presetAwards, setPresetAwards] = useState<Award[]>([]);
  const [filteredAwards, setFilteredAwards] = useState<Award[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<AwardType | 'ALL'>('ALL');
  const [filterTier, setFilterTier] = useState<AwardTier | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<AwardStatus | 'ALL'>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingAward, setEditingAward] = useState<Award | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Form data for template creation/editing
  const [formData, setFormData] = useState<AwardFormData>({
    name: '',
    description: '',
    type: AwardType.ACADEMIC,
    tier: AwardTier.BRONZE,
    icon: '🏆',
    recipientId: '',
    reason: ''
  });

  // Template Assignment states
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [assignmentReason, setAssignmentReason] = useState<string>('');
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignedAwards, setAssignedAwards] = useState<Award[]>([]);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [awardToRemove, setAwardToRemove] = useState<Award | null>(null);

  const students = useMemo(() => {
    console.log('=== STUDENT FILTERING DEBUG ===');
    console.log('UnifiedAwardsManagement: users array:', users);
    console.log('UnifiedAwardsManagement: users length:', users?.length || 0);
    console.log('UnifiedAwardsManagement: UserRole.STUDENT constant:', UserRole.STUDENT);
    
    if (users && users.length > 0) {
      console.log('UnifiedAwardsManagement: First user example:', users[0]);
      console.log('UnifiedAwardsManagement: User roles in array:', users.map(u => ({ id: u.id, name: u.firstName + ' ' + u.lastName, role: u.role, roles: u.roles })));
    }
    
    const filteredStudents = users.filter(user => {
      const isStudentRole = user.role === UserRole.STUDENT;
      const hasStudentInRoles = Array.isArray(user.roles) && user.roles.includes(UserRole.STUDENT);
      const isStudent = isStudentRole || hasStudentInRoles;
      console.log(`User ${user.firstName} ${user.lastName} (${user.id}): role=${user.role}, roles=${JSON.stringify(user.roles)}, isStudent=${isStudent}`);
      return isStudent;
    });
    
    console.log('UnifiedAwardsManagement: filtered students:', filteredStudents);
    console.log('UnifiedAwardsManagement: filtered students length:', filteredStudents?.length || 0);
    console.log('=== END STUDENT FILTERING DEBUG ===');
    return filteredStudents;
  }, [users]);

  const iconOptions = availableIconNames.map(name => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1'),
    value: name
  }));

  // Fetch preset awards
  const fetchPresetAwards = useCallback(async () => {
    try {
      const templates = await api.getAwardTemplates();
      // Apply client-side filtering for templates
      let filtered = templates;
      
      if (filterType !== 'ALL') {
        filtered = filtered.filter(award => award.type === filterType);
      }
      if (filterTier !== 'ALL') {
        filtered = filtered.filter(award => award.tier === filterTier);
      }
      if (searchTerm) {
        filtered = filtered.filter(award => 
          award.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          award.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setPresetAwards(filtered);
      setTotalPages(Math.ceil(filtered.length / 20));
    } catch (error) {
      console.error('Failed to fetch preset awards:', error);
    }
  }, [filterStatus, filterType, filterTier, searchTerm, currentPage]);

  useEffect(() => {
    fetchPresetAwards();
  }, [fetchPresetAwards]);



  // Filter awards for display
  useEffect(() => {
    let filtered = presetAwards;
    
    if (searchTerm) {
      filtered = filtered.filter(award => 
        award.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        award.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredAwards(filtered);
  }, [presetAwards, searchTerm]);

  // Load assigned awards when assign-templates tab is active
  useEffect(() => {
    const loadAssignedAwards = async () => {
      if (activeTab === 'assign-templates') {
        try {
          const response = await api.getAwards({});
          const awarded = response.awards.filter(award => award.recipientId && award.recipientId !== '');
          setAssignedAwards(awarded);
        } catch (error) {
          console.error('Error loading assigned awards:', error);
        }
      }
    };
    
    loadAssignedAwards();
  }, [activeTab]);

  // Reset quick award form
  const resetQuickAwardForm = () => {
    setStudentId('');
    setPoints(25);
    setBadgeTier(BadgeTier.BRONZE);
    setReason('');
    setDescription('');
    setIcon('');
    setCreateFormalAward(false);
    setAwardType(AwardType.ACADEMIC);
    setUsePresetAward(false);
    setSelectedPresetId('');
  };

  // Reset template form
  const resetTemplateForm = () => {
    setFormData({
      name: '',
      description: '',
      type: AwardType.ACADEMIC,
      tier: AwardTier.BRONZE,
      icon: '🏆',
      recipientId: '',
      reason: ''
    });
    setEditingAward(null);
  };

  // Handle quick award submission
  const handleQuickAwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const selectedStudent = students.find(s => s.id === studentId);
    if (!selectedStudent || !reason) {
      setError("Please select a student and provide a reason for the award.");
      return;
    }

    setIsLoading(true);
    try {
      if (usePresetAward && selectedPresetId) {
        // Use template system for preset awards
        const preset = presetAwards.find(a => a.id === selectedPresetId);
        if (!preset) {
          setError('Selected preset award not found.');
          return;
        }
        await api.createAwardFromTemplate(selectedPresetId, studentId);
      } else {
        // Create custom award directly
        const awardTierMap: Record<BadgeTier, AwardTier> = {
          [BadgeTier.BRONZE]: AwardTier.BRONZE,
          [BadgeTier.SILVER]: AwardTier.SILVER,
          [BadgeTier.GOLD]: AwardTier.GOLD,
        };
        
        const awardData = {
          name: description || `${awardType} Award`,
          description: description || reason,
          type: awardType,
          tier: awardTierMap[badgeTier],
          icon: icon || '🏆',
          recipientId: studentId,
          reason: reason
        };
        
        await api.createAward(awardData);
      }
      
      onUpdate();
      setIsSuccess(true);
      setLastAwardedStudentName(selectedStudent.firstName + ' ' + selectedStudent.lastName);
      resetQuickAwardForm();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };



  // Handle template form submission
  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      if (editingAward) {
        await api.updateAward(editingAward.id, formData);
      } else {
        // Create template with template-specific data
        await api.createAwardTemplate({
          name: formData.name,
          description: formData.description,
          type: formData.type, // This will be filtered out in the API call
          tier: formData.tier,
          icon: formData.icon,
          templateName: formData.name, // Use name as template name
        });
      }
      
      setShowForm(false);
      resetTemplateForm();
      fetchPresetAwards();
      onUpdate();
    } catch (error) {
      console.error('Error saving award template:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = async (awardId: string) => {
    if (!confirm('Are you sure you want to delete this award template?')) return;
    
    try {
      await api.deleteAward(awardId);
      fetchPresetAwards();
      onUpdate();
    } catch (error) {
      console.error('Error deleting award template:', error);
    }
  };

  // Handle template editing
  const handleEditTemplate = (award: Award) => {
    setEditingAward(award);
    setFormData({
      name: award.name,
      description: award.description,
      type: award.type,
      tier: award.tier,
      icon: award.icon,
      recipientId: award.recipientId || '',
      reason: award.reason || ''
    });
    setShowForm(true);
  };

  // Handle award another action
  const handleAwardAnother = () => {
    resetQuickAwardForm();
    setError(null);
    setIsSuccess(false);
  };

  // Template assignment handlers
  const handleAssignTemplate = async () => {
    if (!selectedTemplateId || !selectedStudentId) return;
    
    setAssignmentLoading(true);
    try {
      const template = presetAwards.find(award => award._id === selectedTemplateId);
      if (!template) throw new Error('Template not found');
      
      const student = students.find(s => s._id === selectedStudentId);
      if (!student) throw new Error('Student not found');
      
      const awardData = {
        name: template.name,
        description: template.description,
        type: template.type,
        tier: template.tier,
        icon: template.icon,
        recipientId: selectedStudentId,
        reason: assignmentReason || template.description
      };
      
      const response = await api.createAward(awardData);
      
      // Add to assigned awards list
      const newAward = {
        ...response,
        recipientName: `${student.firstName} ${student.lastName}`
      };
      setAssignedAwards(prev => [newAward, ...prev]);
      
      // Reset form
      setSelectedTemplateId('');
      setSelectedStudentId('');
      setAssignmentReason('');
      
      onUpdate();
    } catch (error) {
      console.error('Error assigning template:', error);
    } finally {
      setAssignmentLoading(false);
    }
  };
  
  const handleRemoveAward = async () => {
    if (!awardToRemove) return;
    
    try {
      await api.deleteAward(awardToRemove._id);
      setAssignedAwards(prev => prev.filter(award => award._id !== awardToRemove._id));
      setShowRemoveConfirm(false);
      setAwardToRemove(null);
      onUpdate();
    } catch (error) {
      console.error('Error removing award:', error);
    }
  };

  // Tab content renderers
  const renderQuickAwardTab = () => {
    if (isSuccess) {
      return (
        <div className="text-center p-8 h-full flex flex-col justify-center items-center">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-secondary" />
          <h3 className="mt-2 text-lg font-medium text-text-primary">Success!</h3>
          <p className="mt-2 text-sm text-text-secondary">
            {createFormalAward 
              ? `Point log and formal award sent to ${lastAwardedStudentName}.`
              : `Award sent to ${lastAwardedStudentName}.`
            }
          </p>
          <Button onClick={handleAwardAnother} className="mt-6" variant="secondary">
            Make Another Award
          </Button>
        </div>
      );
    }

    return (
      <form onSubmit={handleQuickAwardSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Select Student</label>
          <SearchableSingleUserSelector
            users={students}
            selectedUserId={studentId}
            onSelectUser={setStudentId}
            placeholder="Search for a student..."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Points</label>
            <Input
              type="number"
              value={points}
              onChange={e => setPoints(Number(e.target.value))}
              min="1"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Badge Tier</label>
            <Select value={badgeTier} onChange={e => setBadgeTier(e.target.value as BadgeTier)}>
              <option key={BadgeTier.BRONZE} value={BadgeTier.BRONZE}>Bronze</option>
              <option key={BadgeTier.SILVER} value={BadgeTier.SILVER}>Silver</option>
              <option key={BadgeTier.GOLD} value={BadgeTier.GOLD}>Gold</option>
            </Select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Reason *</label>
          <Input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Why is this student receiving this award?"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Badge Icon (Optional)</label>
          <Select value={icon} onChange={e => setIcon(e.target.value)}>
            <option key="default" value="">Default Medal Icon</option>
            {iconOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.name}</option>)}
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Description (Optional)</label>
          <Input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Provide additional details..."
          />
        </div>

        {/* Formal Award Integration */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center space-x-3 mb-3">
            <input
              type="checkbox"
              id="createFormalAward"
              checked={createFormalAward}
              onChange={(e) => setCreateFormalAward(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
            />
            <label htmlFor="createFormalAward" className="text-sm font-medium text-text-primary">
              Also create formal award record
            </label>
          </div>
          
          {createFormalAward && (
            <div className="space-y-4">
              {/* Preset Award Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="usePresetAward"
                  checked={usePresetAward}
                  onChange={(e) => setUsePresetAward(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="usePresetAward" className="text-sm text-text-secondary">
                  Use preset award template
                </label>
              </div>

              {/* Preset Award Selection */}
              {usePresetAward && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Preset Award</label>
                  <Select
                    value={selectedPresetId}
                    onChange={(e) => setSelectedPresetId(e.target.value)}
                    className="w-full"
                  >
                    <option key="select" value="">Select a preset award</option>
                    {presetAwards.filter(award => award.status === AwardStatus.PENDING).map(award => (
                      <option key={award.id} value={award.id}>
                        {award.icon} {award.name} ({award.tier})
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              {/* Manual Award Category Selection */}
              {!usePresetAward && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Award Category</label>
                  <Select value={awardType} onChange={e => setAwardType(e.target.value as AwardType)}>
                    <option key={AwardType.ACADEMIC} value={AwardType.ACADEMIC}>Academic Excellence</option>
                    <option key={AwardType.BEHAVIOR} value={AwardType.BEHAVIOR}>Outstanding Behavior</option>
                    <option key={AwardType.PARTICIPATION} value={AwardType.PARTICIPATION}>Active Participation</option>
                    <option key={AwardType.LEADERSHIP} value={AwardType.LEADERSHIP}>Leadership</option>
                    <option key={AwardType.COMMUNITY_SERVICE} value={AwardType.COMMUNITY_SERVICE}>Community Service</option>
                    <option key={AwardType.SPECIAL_ACHIEVEMENT} value={AwardType.SPECIAL_ACHIEVEMENT}>Special Achievement</option>
                    <option key={AwardType.CUSTOM} value={AwardType.CUSTOM}>Custom Award</option>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Awarding...' : 'Submit Award'}
        </Button>
      </form>
    );
  };

  const renderTemplateManagementTab = () => {
    return (
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-lg font-semibold text-text-primary">Award Templates</h4>
            <p className="text-text-secondary text-sm">Create and manage reusable award templates</p>
          </div>
          <Button
            onClick={() => {
              resetTemplateForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2"
          >
            <PlusCircleIcon className="w-4 h-4" />
            Create Template
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search awards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onChange={(e) => setFilterType(e.target.value as AwardType | 'ALL')}>
            <option key="ALL" value="ALL">All Types</option>
            <option key={AwardType.ACADEMIC} value={AwardType.ACADEMIC}>Academic</option>
            <option key={AwardType.BEHAVIOR} value={AwardType.BEHAVIOR}>Behavior</option>
            <option key={AwardType.PARTICIPATION} value={AwardType.PARTICIPATION}>Participation</option>
            <option key={AwardType.LEADERSHIP} value={AwardType.LEADERSHIP}>Leadership</option>
            <option key={AwardType.COMMUNITY_SERVICE} value={AwardType.COMMUNITY_SERVICE}>Community Service</option>
            <option key={AwardType.SPECIAL_ACHIEVEMENT} value={AwardType.SPECIAL_ACHIEVEMENT}>Special Achievement</option>
            <option key={AwardType.CUSTOM} value={AwardType.CUSTOM}>Custom</option>
          </Select>
          <Select value={filterTier} onChange={(e) => setFilterTier(e.target.value as AwardTier | 'ALL')}>
            <option key="ALL" value="ALL">All Tiers</option>
            <option key={AwardTier.BRONZE} value={AwardTier.BRONZE}>Bronze</option>
            <option key={AwardTier.SILVER} value={AwardTier.SILVER}>Silver</option>
            <option key={AwardTier.GOLD} value={AwardTier.GOLD}>Gold</option>
          </Select>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as AwardStatus | 'ALL')}>
            <option key="ALL" value="ALL">All Status</option>
            <option key={AwardStatus.PENDING} value={AwardStatus.PENDING}>Template</option>
            <option key={AwardStatus.ACTIVE} value={AwardStatus.ACTIVE}>Awarded</option>
          </Select>
        </div>

        {/* Awards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAwards.map(award => (
            <div key={award.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{award.icon}</span>
                  <div>
                    <h5 className="font-semibold text-text-primary">{award.name}</h5>
                    <p className="text-xs text-text-secondary">{award.type} • {award.tier}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditTemplate(award)}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTemplate(award.id)}
                    className="text-danger hover:text-danger"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-text-secondary mb-3">{award.description}</p>
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  award.status === AwardStatus.PENDING 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {award.status === AwardStatus.PENDING ? 'Template' : 'Awarded'}
                </span>
                {award.status === AwardStatus.PENDING && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedPresetId(award.id);
                      setUsePresetAward(true);
                      setCreateFormalAward(true);
                      setActiveTab('quick-award');
                    }}
                  >
                    Use Template
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="ghost"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-text-secondary">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderAssignTemplatesTab = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h4 className="text-lg font-semibold text-text-primary">Assign Templates to Students</h4>
          <p className="text-text-secondary text-sm">Award existing templates to students and manage assigned awards</p>
        </div>

        {/* Assignment Form */}
        <Card className="p-6">
          <h5 className="text-md font-medium text-text-primary mb-4">Assign Template</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Select Template</label>
              <Select 
                value={selectedTemplateId} 
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full"
              >
                <option key="choose" value="">Choose a template...</option>
                {presetAwards.filter(award => !award.recipientId).map(template => (
                  <option key={template.id || template._id} value={template._id}>
                    {template.icon} {template.name} ({template.tier})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Select Student</label>
              <div>
            <SearchableSingleUserSelector
              users={students}
              selectedUserId={selectedStudentId}
              onSelectUser={setSelectedStudentId}
              placeholder="Choose a student..."
            />
          </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-text-primary mb-2">Reason (Optional)</label>
            <Input
              type="text"
              value={assignmentReason}
              onChange={(e) => setAssignmentReason(e.target.value)}
              placeholder="Specific reason for this award..."
              className="w-full"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleAssignTemplate}
              disabled={!selectedTemplateId || !selectedStudentId || assignmentLoading}
              className="flex items-center gap-2"
            >
              {assignmentLoading ? 'Assigning...' : 'Assign Award'}
            </Button>
          </div>
        </Card>

        {/* Assigned Awards List */}
        <Card className="p-6">
          <h5 className="text-md font-medium text-text-primary mb-4">Assigned Awards</h5>
          {assignedAwards.length === 0 ? (
            <p className="text-text-secondary text-center py-8">No awards have been assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {assignedAwards.map(award => (
                <div key={award.id || award._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{award.icon}</span>
                    <div>
                      <h6 className="font-medium text-text-primary">{award.name}</h6>
                      <p className="text-sm text-text-secondary">
                        {award.recipientName} • {award.tier} • {award.reason || award.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAwardToRemove(award);
                      setShowRemoveConfirm(true);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  };

  return (
        <AdminSection 
            title="Awards Management"
            description="Create and manage student awards and templates"
            icon={<GoldMedalIcon className="h-6 w-6 text-gold" />}
        >

      {/* Tab Navigation */}
      <div className="border-b border-border mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('quick-award')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quick-award'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
            }`}
          >
            Quick Award
          </button>
          <button
            onClick={() => setActiveTab('manage-templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manage-templates'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
            }`}
          >
            Manage Templates
          </button>
          <button
            onClick={() => setActiveTab('assign-templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assign-templates'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
            }`}
          >
            Assign Templates
          </button>

        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'quick-award' && renderQuickAwardTab()}
        {activeTab === 'manage-templates' && renderTemplateManagementTab()}
        {activeTab === 'assign-templates' && renderAssignTemplatesTab()}

      </div>



      {/* Template Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingAward ? 'Edit Award Template' : 'Create Award Template'}>
        <form onSubmit={handleTemplateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Award Name *</label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter award name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Description *</label>
            <Input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this award"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Type</label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AwardType }))}
              >
                <option key={AwardType.ACADEMIC} value={AwardType.ACADEMIC}>Academic Excellence</option>
                <option key={AwardType.BEHAVIOR} value={AwardType.BEHAVIOR}>Outstanding Behavior</option>
                <option key={AwardType.PARTICIPATION} value={AwardType.PARTICIPATION}>Active Participation</option>
                <option key={AwardType.LEADERSHIP} value={AwardType.LEADERSHIP}>Leadership</option>
                <option key={AwardType.COMMUNITY_SERVICE} value={AwardType.COMMUNITY_SERVICE}>Community Service</option>
                <option key={AwardType.SPECIAL_ACHIEVEMENT} value={AwardType.SPECIAL_ACHIEVEMENT}>Special Achievement</option>
                <option key={AwardType.CUSTOM} value={AwardType.CUSTOM}>Custom Award</option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Tier</label>
              <Select
                value={formData.tier}
                onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value as AwardTier }))}
              >
                <option key={AwardTier.BRONZE} value={AwardTier.BRONZE}>Bronze</option>
                <option key={AwardTier.SILVER} value={AwardTier.SILVER}>Silver</option>
                <option key={AwardTier.GOLD} value={AwardTier.GOLD}>Gold</option>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Icon</label>
            <Input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              placeholder="🏆"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? 'Saving...' : editingAward ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remove Award Confirmation Modal */}
      <Modal 
        isOpen={showRemoveConfirm} 
        onClose={() => setShowRemoveConfirm(false)} 
        title="Remove Award"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Are you sure you want to remove this award from {awardToRemove?.recipientName}? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setShowRemoveConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleRemoveAward}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove Award
            </Button>
          </div>
        </div>
      </Modal>
    </AdminSection>
  );
};

export default UnifiedAwardsManagement;