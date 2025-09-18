import React, { useState, useMemo } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { AwardIcon, StarIcon, GoldMedalIcon, SilverMedalIcon, BronzeMedalIcon, SparklesIcon } from '../../../assets/icons';
import { getAvatarColor, getInitials } from '../../../utils/helpers';
import SearchableSingleUserSelector from '../../shared/SearchableSingleUserSelector';
import { User, Award } from '../../../types';

interface AwardsSystemProps {
  students: User[];
  awards: Award[];
  users: User[];
  onAwardGrant: (studentId: string, awardData: {
    title: string;
    description: string;
    type: 'gold' | 'silver' | 'bronze' | 'custom';
    category: string;
    icon: string;
  }) => Promise<void>;
}

const AWARD_TYPES = [
  { value: 'gold', label: 'Gold Medal', icon: GoldMedalIcon, color: 'text-yellow-600' },
  { value: 'silver', label: 'Silver Medal', icon: SilverMedalIcon, color: 'text-gray-500' },
  { value: 'bronze', label: 'Bronze Medal', icon: BronzeMedalIcon, color: 'text-amber-600' },
  { value: 'custom', label: 'Custom Award', icon: StarIcon, color: 'text-purple-600' }
];

const AWARD_CATEGORIES = [
  'Academic Excellence',
  'Leadership',
  'Participation',
  'Improvement',
  'Creativity',
  'Teamwork',
  'Community Service',
  'Other'
];

export const AwardsSystem: React.FC<AwardsSystemProps> = ({ students, awards, users, onAwardGrant }) => {
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [awardTitle, setAwardTitle] = useState('');
  const [awardDescription, setAwardDescription] = useState('');
  const [awardType, setAwardType] = useState<'gold' | 'silver' | 'bronze' | 'custom'>('bronze');
  const [awardCategory, setAwardCategory] = useState('Academic Excellence');
  const [awardIcon, setAwardIcon] = useState('🏆');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and search awards
  const filteredAwards = useMemo(() => {
    let filtered = awards;

    if (filterCategory !== 'all') {
      filtered = filtered.filter(award => award.category === filterCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(award => 
        award.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        award.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        award.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [awards, filterCategory, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !awardTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await onAwardGrant(selectedStudent.id, {
        title: awardTitle.trim(),
        description: awardDescription.trim(),
        type: awardType,
        category: awardCategory,
        icon: awardIcon
      });

      // Reset form
      setSelectedStudent(null);
      setAwardTitle('');
      setAwardDescription('');
      setAwardType('bronze');
      setAwardCategory('Academic Excellence');
      setAwardIcon('🏆');
    } catch (error) {
      console.error('Failed to grant award:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAwardIcon = (type: string) => {
    const awardType = AWARD_TYPES.find(t => t.value === type);
    return awardType ? awardType.icon : StarIcon;
  };

  const getAwardColor = (type: string) => {
    const awardType = AWARD_TYPES.find(t => t.value === type);
    return awardType ? awardType.color : 'text-purple-600';
  };

  return (
    <Card icon={<AwardIcon className="h-5 w-5" />} title="Awards System">
      <div className="space-y-6">
        {/* Award Grant Form */}
        <div className="bg-surface-secondary rounded-lg p-4">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <SparklesIcon className="h-4 w-4" />
            Grant New Award
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Select Student
                </label>
                <SearchableSingleUserSelector
                  users={students}
                  selectedUser={selectedStudent}
                  onUserSelect={setSelectedStudent}
                  placeholder="Search and select a student..."
                />
              </div>

              {/* Award Type */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Award Type
                </label>
                <Select
                  value={awardType}
                  onChange={(e) => setAwardType(e.target.value as any)}
                  className="w-full"
                >
                  {AWARD_TYPES.map(type => {
                    const IconComponent = type.icon;
                    return (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    );
                  })}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Award Title */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Award Title
                </label>
                <Input
                  type="text"
                  value={awardTitle}
                  onChange={(e) => setAwardTitle(e.target.value)}
                  placeholder="e.g., Outstanding Performance"
                  className="w-full"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Category
                </label>
                <Select
                  value={awardCategory}
                  onChange={(e) => setAwardCategory(e.target.value)}
                  className="w-full"
                >
                  {AWARD_CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Icon
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{awardIcon}</span>
                  <Input
                    type="text"
                    value={awardIcon}
                    onChange={(e) => setAwardIcon(e.target.value)}
                    placeholder="🏆"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-text-secondary mt-1">Choose an emoji or text icon for this award</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Description (Optional)
              </label>
              <textarea
                value={awardDescription}
                onChange={(e) => setAwardDescription(e.target.value)}
                placeholder="Provide additional details about this award..."
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface text-text-primary"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={!selectedStudent || !awardTitle.trim() || isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting ? 'Granting Award...' : 'Grant Award'}
            </Button>
          </form>
        </div>

        {/* Awards History */}
        <div>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search awards by title, student, or description..."
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full"
              >
                <option key="all" value="all">All Categories</option>
                {AWARD_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-text-primary flex items-center gap-2">
              <AwardIcon className="h-4 w-4" />
              Awards History ({filteredAwards.length} awards)
            </h4>

            {filteredAwards.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <AwardIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No awards found for the selected filters.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAwards.map((award) => {
                  const student = students.find(s => s.id === award.studentId);
                  const grantedByUser = users.find(u => u.id === award.grantedBy);
                  const IconComponent = getAwardIcon(award.type);
                  
                  return (
                    <div key={award.id} className="bg-surface-secondary rounded-lg p-4 border border-border">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg bg-surface ${getAwardColor(award.type)}`}>
                            {award.icon ? (
                              <span className="text-xl">{award.icon}</span>
                            ) : (
                              <IconComponent className="h-5 w-5" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium text-text-primary truncate">
                                {award.title}
                              </h5>
                              <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                                <SparklesIcon className="h-3 w-3" />
                                {award.category}
                              </span>
                            </div>
                            
                            {student && (
                              <div className="flex items-center gap-2 mb-2">
                                <div 
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                                  style={{ backgroundColor: getAvatarColor(student.id) }}
                                >
                                  {getInitials(student.name || `${student.firstName} ${student.lastName}`)}
                                </div>
                                <span className="text-sm text-text-primary">
                                  {student.name || `${student.firstName} ${student.lastName}`}
                                </span>
                                {student.username && (
                                  <span className="text-xs text-text-secondary">@{student.username}</span>
                                )}
                              </div>
                            )}
                            
                            {award.description && (
                              <p className="text-sm text-text-secondary mb-2">
                                {award.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-text-secondary">
                              <span>{formatDate(award.createdAt)}</span>
                              {grantedByUser && (
                                <span>
                                  Granted by {grantedByUser.name || `${grantedByUser.firstName} ${grantedByUser.lastName}`}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};