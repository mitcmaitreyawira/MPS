import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../../components/ui/Card';
import { Award, AwardType, AwardTier, AwardStatus, AwardStats } from '../../../types';
import * as api from '../../../services/api';
import { ChartBarIcon } from '../../../assets/icons';

// Simple icons to avoid dependency issues
const FaTrophy = () => <span>🏆</span>;
const FaMedal = () => <span>🏅</span>;
const FaStar = () => <span>⭐</span>;
const FaAward = () => <span>🎖️</span>;
const FaUsers = () => <span>👥</span>;
const FaCalendar = () => <span>📅</span>;

interface AwardsStatisticsWidgetProps {
  onUpdate?: () => void;
}

interface TopRecipient {
  recipientId: string;
  recipientName: string;
  awardCount: number;
  latestAward: string;
}

interface AwardDistribution {
  type: AwardType;
  count: number;
  percentage: number;
}

interface TierDistribution {
  tier: AwardTier;
  count: number;
  percentage: number;
}

interface StatisticsData {
  totalAwards: number;
  activeAwards: number;
  revokedAwards: number;
  uniqueRecipients: number;
  topRecipients: TopRecipient[];
  typeDistribution: AwardDistribution[];
  tierDistribution: TierDistribution[];
  recentAwards: Award[];
}

export const AwardsStatisticsWidget: React.FC<AwardsStatisticsWidgetProps> = ({ onUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch awards statistics
      const statsResponse = await api.getAwardStats();
      
      // Fetch recent awards for additional insights
      const recentAwardsResponse = await api.getAwards({ 
        limit: 10, 
        sortBy: 'awardedOn', 
        sortOrder: 'desc' 
      });
      
      // Transform backend response to match frontend interface
      const totalAwards = statsResponse.total || 0;
      const byStatus = statsResponse.byStatus || [];
      const activeAwards = byStatus.find(s => s.status === 'active')?.count || 0;
      const revokedAwards = byStatus.find(s => s.status === 'revoked')?.count || 0;
      
      // Transform type distribution
      const typeDistribution = (statsResponse.byType || []).map(item => ({
        type: item.type,
        count: item.count,
        percentage: totalAwards > 0 ? (item.count / totalAwards) * 100 : 0
      }));
      
      // Transform tier distribution
      const tierDistribution = (statsResponse.byTier || []).map(item => ({
        tier: item.tier,
        count: item.count,
        percentage: totalAwards > 0 ? (item.count / totalAwards) * 100 : 0
      }));
      
      // Transform top recipients
      const topRecipients = (statsResponse.topRecipients || []).map(item => ({
        recipientId: item._id,
        recipientName: item.recipient ? `${item.recipient.firstName} ${item.recipient.lastName}` : 'Unknown',
        awardCount: item.count,
        latestAward: 'N/A' // We'll get this from recent awards if needed
      }));
      
      setStats({
        totalAwards,
        activeAwards,
        revokedAwards,
        uniqueRecipients: topRecipients.length,
        topRecipients,
        typeDistribution,
        tierDistribution,
        recentAwards: recentAwardsResponse.awards || []
      });
    } catch (err) {
      console.error('Failed to fetch awards statistics:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [selectedPeriod]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTierColor = (tier: AwardTier) => {
    switch (tier) {
      case AwardTier.BRONZE:
        return 'text-amber-600 bg-amber-100';
      case AwardTier.SILVER:
        return 'text-gray-600 bg-gray-100';
      case AwardTier.GOLD:
        return 'text-yellow-600 bg-yellow-100';
      case AwardTier.PLATINUM:
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: AwardType) => {
    switch (type) {
      case AwardType.ACADEMIC:
        return <FaTrophy />;
      case AwardType.BEHAVIOR:
        return <FaMedal />;
      case AwardType.LEADERSHIP:
        return <FaStar />;
      case AwardType.PARTICIPATION:
        return <FaAward />;
      case AwardType.COMMUNITY_SERVICE:
        return <FaStar />;
      case AwardType.SPECIAL_ACHIEVEMENT:
        return <FaTrophy />;
      default:
        return <FaAward />;
    }
  };

  if (loading) {
    return (
      <Card title="Awards Statistics" icon={<ChartBarIcon className="h-5 w-5" />}>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-blue-200 h-16 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-blue-200 h-32 rounded-lg"></div>
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card title="Awards Statistics" icon={<ChartBarIcon className="h-5 w-5" />}>
        <div className="text-center py-8">
          <p className="text-red-500">{error || 'Failed to load statistics'}</p>
          <button
            onClick={fetchStatistics}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Awards Statistics" icon={<ChartBarIcon className="h-5 w-5" />}>
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-blue-900">Overview</h3>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
            className="px-3 py-1 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Awards</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalAwards}</p>
              </div>
              <FaTrophy className="text-2xl" />
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Awards</p>
                <p className="text-2xl font-bold text-green-900">{stats.activeAwards}</p>
              </div>
              <FaMedal className="text-2xl" />
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Recipients</p>
                <p className="text-2xl font-bold text-purple-900">{stats.uniqueRecipients}</p>
              </div>
              <FaUsers className="text-2xl" />
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Revoked</p>
                <p className="text-2xl font-bold text-red-900">{stats.revokedAwards}</p>
              </div>
              <span className="text-2xl">🚫</span>
            </div>
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Award Type Distribution */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Award Types</h4>
            <div className="space-y-2">
              {stats.typeDistribution.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(item.type)}
                    <span className="text-sm font-medium text-gray-700">
                      {String(item.type).charAt(0).toUpperCase() + String(item.type).slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-blue-600 w-8">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Award Tier Distribution */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-md font-semibold text-blue-900 mb-3">Award Tiers</h4>
            <div className="space-y-2">
              {stats.tierDistribution.map((item) => (
                <div key={item.tier} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(item.tier)}`}>
                      {String(item.tier).charAt(0).toUpperCase() + String(item.tier).slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-purple-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-purple-600 w-8">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Recipients */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-green-900 mb-3">Top Recipients</h4>
          {stats.topRecipients.length > 0 ? (
            <div className="space-y-2">
              {stats.topRecipients.slice(0, 5).map((recipient, index) => (
                <div key={recipient.recipientId} className="flex items-center justify-between bg-white p-2 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-indigo-100 text-indigo-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">{recipient.recipientName}</p>
                      <p className="text-xs text-green-500">Latest: {formatDate(recipient.latestAward)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{recipient.awardCount}</p>
                    <p className="text-xs text-gray-500">awards</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No recipients found</p>
          )}
        </div>

        {/* Recent Awards */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-gray-900 mb-3">Recent Awards</h4>
          {stats.recentAwards.length > 0 ? (
            <div className="space-y-2">
              {stats.recentAwards.slice(0, 5).map((award) => (
                <div key={award.id} className="flex items-center justify-between bg-white p-2 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{award.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{award.name}</p>
                      <p className="text-xs text-gray-500">{award.recipientName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{formatDate(award.awardedOn)}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierColor(award.tier)}`}>
                      {String(award.tier).charAt(0).toUpperCase() + String(award.tier).slice(1).toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No recent awards found</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AwardsStatisticsWidget;