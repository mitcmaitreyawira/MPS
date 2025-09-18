import React from 'react';

interface TableProps {
    headers: string[];
    children: React.ReactNode;
    mobileCardView?: boolean;
}

export const Table: React.FC<TableProps> = ({ headers, children, mobileCardView = false }) => {
    if (mobileCardView) {
        // Mobile card view - render children as cards instead of table rows
        return (
            <div className="block md:hidden space-y-4">
                {children}
            </div>
        );
    }

    return (
        <>
            {/* Desktop table view */}
            <div className="hidden md:block w-full overflow-x-auto border border-border rounded-lg">
                <table className="min-w-full text-left text-sm text-text-secondary">
                    <thead className="border-b border-border bg-blue-50">
                        <tr>
                            {headers.map(header => (
                                <th key={header} scope="col" className="px-6 py-4 text-text-primary font-semibold">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {children}
                    </tbody>
                </table>
            </div>
            
            {/* Mobile horizontal scroll fallback */}
            <div className="block md:hidden w-full overflow-x-auto border border-border rounded-lg">
                <table className="min-w-[800px] text-left text-sm text-text-secondary">
                    <thead className="border-b border-border bg-blue-50">
                        <tr>
                            {headers.map(header => (
                                <th key={header} scope="col" className="px-4 py-3 text-text-primary font-semibold text-xs">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {children}
                    </tbody>
                </table>
            </div>
        </>
    );
};