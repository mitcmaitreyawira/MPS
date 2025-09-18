import React, { useState, useEffect } from 'react';
import { DataSyncVerification, SyncIssue, HealthSummary } from '../../utils/dataSyncVerification';
import { Button } from './ui/Button';
// Using simple text icons instead of lucide-react
const AlertCircle = () => <span>⚠️</span>;
const CheckCircle = () => <span>✅</span>;
const RefreshCw = ({ className }: { className?: string }) => <span className={className}>🔄</span>;
const Wifi = ({ className }: { className?: string }) => <span className={className}>📶</span>;
const WifiOff = ({ className }: { className?: string }) => <span className={className}>📵</span>;

interface HealthMonitorProps {
  compact?: boolean;
  showDetails?: boolean;
}

export const HealthMonitor: React.FC<HealthMonitorProps> = ({ 
  compact = false, 
  showDetails = false 
}) => {
  const [healthSummary, setHealthSummary] = useState<HealthSummary | null>(null);
  const [issues, setIssues] = useState<SyncIssue[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showIssueDetails, setShowIssueDetails] = useState(showDetails);

  useEffect(() => {
    // Subscribe to sync issues
    const unsubscribe = DataSyncVerification.subscribe((newIssues) => {
      setIssues(newIssues);
      setHealthSummary(DataSyncVerification.getHealthSummary());
    });

    // Get initial state
    setIssues(DataSyncVerification.getCurrentIssues());
    setHealthSummary(DataSyncVerification.getHealthSummary());

    return unsubscribe;
  }, []);

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    try {
      await DataSyncVerification.forceSyncRefresh();
      // Trigger a health check after refresh
      setTimeout(() => {
        DataSyncVerification.performHealthCheck();
      }, 1000);
    } catch (error) {
      console.error('Failed to force refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = () => {
    if (!healthSummary) return <Wifi className="text-gray-400" />;
    
    if (healthSummary.healthy) {
      return <CheckCircle />;
    }
    
    if (healthSummary.criticalCount > 0 || healthSummary.errorCount > 0) {
      return <WifiOff className="text-red-500" />;
    }
    
    return <AlertCircle />;
  };

  const getStatusText = () => {
    if (!healthSummary) return 'Checking...';
    
    if (healthSummary.healthy) {
      return 'Sync Healthy';
    }
    
    if (healthSummary.criticalCount > 0) {
      return `${healthSummary.criticalCount} Critical Issue${healthSummary.criticalCount > 1 ? 's' : ''}`;
    }
    
    if (healthSummary.errorCount > 0) {
      return `${healthSummary.errorCount} Error${healthSummary.errorCount > 1 ? 's' : ''}`;
    }
    
    if (healthSummary.warningCount > 0) {
      return `${healthSummary.warningCount} Warning${healthSummary.warningCount > 1 ? 's' : ''}`;
    }
    
    return 'All Good';
  };

  const getStatusColor = () => {
    if (!healthSummary) return 'text-gray-500';
    
    if (healthSummary.healthy) return 'text-green-600';
    if (healthSummary.criticalCount > 0 || healthSummary.errorCount > 0) return 'text-red-600';
    if (healthSummary.warningCount > 0) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const formatIssueTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className={`text-sm ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        {!healthSummary?.healthy && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleForceRefresh}
            disabled={isRefreshing}
            className="h-6 px-2"
          >
            {isRefreshing ? (
              <RefreshCw className="animate-spin" />
            ) : (
              <RefreshCw />
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Data Sync Status
            </h3>
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {issues.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowIssueDetails(!showIssueDetails)}
            >
              {showIssueDetails ? 'Hide' : 'Show'} Details
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleForceRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2" />
                Force Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {healthSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {healthSummary.totalIssues === 0 ? '✓' : healthSummary.totalIssues}
            </div>
            <div className="text-xs text-gray-500">Total Issues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {healthSummary.criticalCount + healthSummary.errorCount}
            </div>
            <div className="text-xs text-gray-500">Critical/Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {healthSummary.warningCount}
            </div>
            <div className="text-xs text-gray-500">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {healthSummary.infoCount}
            </div>
            <div className="text-xs text-gray-500">Info</div>
          </div>
        </div>
      )}

      {showIssueDetails && issues.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 mb-2">Issues Details:</h4>
          {issues.map((issue, index) => (
            <div
              key={index}
              className={`p-3 rounded-md border-l-4 ${
                issue.type === 'critical' || issue.type === 'error'
                  ? 'bg-red-50 border-red-400'
                  : issue.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-400'
                  : 'bg-blue-50 border-blue-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        issue.type === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : issue.type === 'error'
                          ? 'bg-red-100 text-red-800'
                          : issue.type === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {issue.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {issue.category.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {issue.message}
                  </p>
                  {issue.details && (
                    <p className="text-xs text-gray-600 mt-1">
                      {issue.details}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400 ml-4">
                  {formatIssueTime(issue.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {healthSummary?.lastCheck && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last health check: {formatIssueTime(healthSummary.lastCheck)}
          </p>
        </div>
      )}
    </div>
  );
};

export default HealthMonitor;