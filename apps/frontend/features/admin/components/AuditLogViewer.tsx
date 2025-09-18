

import React, { useState } from 'react';
import { AuditLog } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { ChevronDownIcon } from '../../../assets/icons';

export const AuditLogViewer: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleToggle = (logId: string) => {
        setExpandedId(prevId => (prevId === logId ? null : logId));
    };

    return (
        <Card title="Audit Log">
            <div className="max-h-[32rem] overflow-y-auto pr-2">
                <ul className="space-y-3">
                    {logs.length > 0 ? logs.map(log => {
                        const isExpanded = expandedId === log.id;
                        return (
                            <li key={log.id} className="text-xs p-3 bg-slate-50 rounded-lg border border-border">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-text-primary">{log.action.replace(/_/g, ' ')}</span>
                                    <span className="font-mono text-text-secondary">{new Date(log.timestamp).toLocaleString()}</span>
                                </div>
                                <p className="text-text-secondary">Admin <span className="font-medium text-text-primary">{log.adminId}</span> performed this action.</p>
                                <div className="mt-2">
                                    <button
                                        onClick={() => handleToggle(log.id)}
                                        aria-expanded={isExpanded}
                                        className="w-full text-primary text-xs font-medium flex justify-between items-center group"
                                    >
                                        <span>View Details</span>
                                        <ChevronDownIcon className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isExpanded && (
                                        <div className="animate-fade-in-up">
                                            <pre className="text-slate-600 text-xs mt-2 bg-slate-100 p-2 rounded overflow-x-auto">
                                                {JSON.stringify(log.details, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </li>
                        );
                    }) : (
                         <p className="text-center text-text-secondary py-12">No audit logs found.</p>
                    )}
                </ul>
            </div>
        </Card>
    );
}