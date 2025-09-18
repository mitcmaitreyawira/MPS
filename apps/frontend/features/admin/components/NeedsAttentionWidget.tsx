

import React from 'react';
import { Card } from '../../../components/ui/Card';
import { BellIcon, FlagIcon, ScaleIcon } from '../../../assets/icons';
import { Button } from '../../../components/ui/Button';

interface NeedsAttentionWidgetProps {
    pendingReports: number;
    pendingAppeals: number;
}

export const NeedsAttentionWidget: React.FC<NeedsAttentionWidgetProps> = ({ pendingReports, pendingAppeals }) => {
    const hasItems = pendingReports > 0 || pendingAppeals > 0;

    return (
        <Card title="Needs Attention" icon={<BellIcon className="h-5 w-5" />}>
            <div className="space-y-4">
                {hasItems ? (
                    <>
                        {pendingReports > 0 && (
                            <div className="flex justify-between items-center bg-amber-50 p-3 rounded-lg">
                                <div>
                                    <p className="font-semibold text-text-primary flex items-center">
                                        <FlagIcon className="h-4 w-4 mr-2 text-amber-600" />
                                        New Teacher Reports
                                    </p>
                                    <p className="text-sm text-amber-700">{pendingReports} report(s) to review.</p>
                                </div>
                                <a href="#teacher-reports">
                                    <Button size="sm" variant='secondary' className='bg-amber-200 text-amber-800 hover:bg-amber-300'>
                                        Review
                                    </Button>
                                </a>
                            </div>
                        )}
                        {pendingAppeals > 0 && (
                             <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                <div>
                                    <p className="font-semibold text-text-primary flex items-center">
                                        <ScaleIcon className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
                                        New Student Appeals
                                    </p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">{pendingAppeals} appeal(s) to review.</p>
                                </div>
                                <a href="#appeal-manager">
                                    <Button size="sm" variant='secondary' className='bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500'>
                                        Review
                                    </Button>
                                </a>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
                             <BellIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="mt-2 text-lg font-medium text-text-primary">All Clear!</h3>
                        <p className="mt-1 text-sm text-text-secondary">No items need your immediate attention.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};