import React, { useEffect, useState } from 'react';
import * as api from '../../../services/api';

interface IntegrityIssue {
  type: string;
  message: string;
  total?: number;
  sample?: any[];
}

export const SystemHealthWidget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<any>(null);
  const [integrity, setIntegrity] = useState<{ status: string; timestamp: string; issues: IntegrityIssue[] } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [full, integrityReport] = await Promise.allSettled([
          api.getHealthFull(),
          api.getIntegrityReport(),
        ]);
        if (!mounted) return;
        if (full.status === 'fulfilled') setHealth(full.value);
        else setError('Failed to load deep health');
        if (integrityReport.status === 'fulfilled') setIntegrity(integrityReport.value as any);
        else {
          // Likely 401/403 for non-admin roles; degrade gracefully
          setIntegrity({ status: 'restricted', timestamp: new Date().toISOString(), issues: [] });
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load system health');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-4 rounded-lg bg-gray-50 border"><div className="animate-pulse h-6 w-40 bg-gray-200 rounded"/></div>;
  }

  if (error) {
    return <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">{error}</div>;
  }

  const dbStatus = health?.database?.error ? 'degraded' : 'ok';
  const counts = health?.counts || {};
  const issues = integrity?.issues || [];

  return (
    <div className="p-4 rounded-lg bg-white border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">System Health</h2>
        <span className={`text-xs px-2 py-1 rounded ${health?.status === 'ok' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {health?.status?.toUpperCase() || 'UNKNOWN'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 rounded border">
          <div className="text-sm text-gray-500">Database</div>
          <div className="mt-1 font-medium">{dbStatus.toUpperCase()}</div>
          <div className="text-xs text-gray-500">readyState: {String(health?.database?.readyState)} | ping: {health?.database?.pingMs ?? '-'}ms</div>
        </div>
        <div className="p-3 rounded border">
          <div className="text-sm text-gray-500">Cache</div>
          <div className="mt-1 font-medium">{health?.cache?.enabled ? 'ENABLED' : 'DISABLED'}</div>
          <div className="text-xs text-gray-500">entries: {health?.cache?.entries ?? '-'}</div>
        </div>
        <div className="p-3 rounded border">
          <div className="text-sm text-gray-500">Integrity</div>
          <div className="mt-1 font-medium">{integrity?.status?.toUpperCase() || 'UNKNOWN'}</div>
          <div className="text-xs text-gray-500">issues: {issues.length}</div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-medium mb-2">Collection counts</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-sm">
          {Object.keys(counts).map((k) => (
            <div key={k} className="p-2 rounded border bg-gray-50 flex items-center justify-between">
              <span className="text-gray-600">{k}</span>
              <span className="font-semibold">{typeof counts[k] === 'number' ? counts[k] : 'ERR'}</span>
            </div>
          ))}
        </div>
      </div>

      {issues.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Integrity issues</h3>
          <ul className="space-y-2">
            {issues.slice(0, 5).map((issue, idx) => (
              <li key={idx} className="p-3 rounded border bg-amber-50 border-amber-200">
                <div className="text-sm font-semibold">{issue.type}</div>
                <div className="text-sm text-amber-800">{issue.message}</div>
                {typeof issue.total === 'number' && (
                  <div className="text-xs text-amber-700">total: {issue.total}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
