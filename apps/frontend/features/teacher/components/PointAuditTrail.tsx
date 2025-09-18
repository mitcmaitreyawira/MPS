import React, { useState, useMemo } from 'react';
import { User, PointLog, PointType } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { ClipboardDocumentCheckIcon, ClockIcon, UserCircleIcon, FlagIcon, MagnifyingGlassIcon } from '../../../assets/icons';
import { getAvatarColor, getInitials } from '../../../utils/helpers';
import SearchableSingleUserSelector from '../../shared/SearchableSingleUserSelector';

interface PointAuditTrailProps {
    students: User[];
    points: PointLog[];
    users: User[]; // All users to find who added the points
}

export const PointAuditTrail: React.FC<PointAuditTrailProps> = ({ students, points, users }) => {
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [filterType, setFilterType] = useState<'all' | 'reward' | 'violation'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<'all' | '7days' | '30days' | '90days'>('30days');

    const selectedStudent = useMemo(() => {
        return students.find(s => s.id === selectedStudentId) || null;
    }, [students, selectedStudentId]);

    const filteredPoints = useMemo(() => {
        if (!selectedStudentId) return [];

        let filtered = points.filter(p => p.studentId === selectedStudentId);

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(p => {
                if (filterType === 'reward') return p.type === PointType.REWARD;
                if (filterType === 'violation') return p.type === PointType.VIOLATION;
                return true;
            });
        }

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.category.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower)
            );
        }

        // Filter by date range
        if (dateRange !== 'all') {
            const now = new Date();
            const daysAgo = {
                '7days': 7,
                '30days': 30,
                '90days': 90
            }[dateRange];
            const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(p => new Date(p.createdAt) >= cutoffDate);
        }

        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [points, selectedStudentId, filterType, searchTerm, dateRange]);

    const pointsSummary = useMemo(() => {
        if (!selectedStudentId) return { total: 0, rewards: 0, violations: 0, recentActivity: 0 };

        const studentPoints = points.filter(p => p.studentId === selectedStudentId);
        const total = studentPoints.reduce((sum, p) => sum + p.points, 0);
        const rewards = studentPoints.filter(p => p.type === PointType.REWARD).reduce((sum, p) => sum + p.points, 0);
        const violations = studentPoints.filter(p => p.type === PointType.VIOLATION).reduce((sum, p) => sum + p.points, 0);
        
        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentActivity = studentPoints
            .filter(p => new Date(p.createdAt) >= sevenDaysAgo)
            .reduce((sum, p) => sum + p.points, 0);

        return { total, rewards, violations, recentActivity };
    }, [points, selectedStudentId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getAddedByUser = (addedById: string) => {
        return users.find(u => u.id === addedById);
    };

    return (
        <Card icon={<ClipboardDocumentCheckIcon className="h-5 w-5" />} title="Point Audit Trail">
            <div className="space-y-6">
                {/* Student Selection */}
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">Select Student</label>
                    <SearchableSingleUserSelector
                        users={students}
                        selectedUserId={selectedStudentId}
                        onSelectUser={setSelectedStudentId}
                        placeholder="Search and select a student to view their point history..."
                    />
                </div>

                {selectedStudent && (
                    <>
                        {/* Student Summary */}
                        <div className="bg-slate-50 rounded-lg p-4 border border-border">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getAvatarColor(selectedStudent.name || 'Unknown')}`}>
                                    {getInitials(selectedStudent.name || 'Unknown')}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-primary text-lg">{selectedStudent.name}</h3>
                                    <p className="text-sm text-text-secondary">{selectedStudent.className || 'No class assigned'}</p>
                                    {selectedStudent.username && <p className="text-xs text-text-secondary">@{selectedStudent.username}</p>}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{pointsSummary.total}</div>
                                    <div className="text-xs text-text-secondary">Total Points</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-secondary">{pointsSummary.rewards}</div>
                                    <div className="text-xs text-text-secondary">Rewards</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-danger">{Math.abs(pointsSummary.violations)}</div>
                                    <div className="text-xs text-text-secondary">Violations</div>
                                </div>
                                <div className="text-center">
                                    <div className={`text-2xl font-bold ${pointsSummary.recentActivity >= 0 ? 'text-secondary' : 'text-danger'}`}>
                                        {pointsSummary.recentActivity >= 0 ? '+' : ''}{pointsSummary.recentActivity}
                                    </div>
                                    <div className="text-xs text-text-secondary">Last 7 Days</div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Filter by Type</label>
                                <Select value={filterType} onChange={e => setFilterType(e.target.value as any)}>
                                    <option value="all">All Types</option>
                                    <option value="reward">Rewards Only</option>
                                    <option value="violation">Violations Only</option>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Date Range</label>
                                <Select value={dateRange} onChange={e => setDateRange(e.target.value as any)}>
                                    <option value="all">All Time</option>
                                    <option value="7days">Last 7 Days</option>
                                    <option value="30days">Last 30 Days</option>
                                    <option value="90days">Last 90 Days</option>
                                </Select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text-secondary mb-1">Search</label>
                                <Input
                                    type="text"
                                    placeholder="Search by category or description..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Point History */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-text-primary flex items-center gap-2">
                                <ClockIcon className="h-4 w-4" />
                                Point History ({filteredPoints.length} entries)
                            </h4>
                            
                            {filteredPoints.length === 0 ? (
                                <div className="text-center py-8 text-text-secondary">
                                    <ClipboardDocumentCheckIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No point entries found for the selected filters.</p>
                                </div>
                            ) : (
                                <div className="max-h-96 overflow-y-auto space-y-2">
                                    {filteredPoints.map((point) => {
                                        const addedByUser = getAddedByUser(point.addedBy);
                                        return (
                                            <div key={point.id} className="bg-white border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                point.type === PointType.REWARD 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {point.type === PointType.REWARD ? 'Reward' : 'Violation'}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                                                                <FlagIcon className="h-3 w-3" />
                                                                {point.category}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-text-primary mb-2">{point.description}</p>
                                                        <div className="flex items-center gap-4 text-xs text-text-secondary">
                                                            <span className="flex items-center gap-1">
                                                                <ClockIcon className="h-3 w-3" />
                                                                {formatDate(point.createdAt)}
                                                            </span>
                                                            {addedByUser && (
                                                                <span className="flex items-center gap-1">
                                                                    <UserCircleIcon className="h-3 w-3" />
                                                                    {addedByUser.name || `${addedByUser.firstName} ${addedByUser.lastName}`}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={`text-right font-bold text-lg ${
                                                        point.points >= 0 ? 'text-secondary' : 'text-danger'
                                                    }`}>
                                                        {point.points >= 0 ? '+' : ''}{point.points}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </Card>
    );
};