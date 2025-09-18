import React, { useMemo } from 'react';
import { useData } from '../../../context/DataContext';
import { Select } from '../../../components/ui/Select';
import { AcademicCapIcon } from '../../../assets/icons';

export const AcademicYearSelector: React.FC = () => {
    const { availableYears, selectedYear, setSelectedYear } = useData();
    
    const getCurrentAcademicYear = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-11
        // Assuming school year starts in July (month 6)
        return month >= 6 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
    };

    const displayYears = useMemo(() => {
        const currentYear = getCurrentAcademicYear();
        const allYears = new Set([currentYear, ...availableYears]);
        return Array.from(allYears).sort((a, b) => b.localeCompare(a));
    }, [availableYears]);

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedYear(e.target.value);
    };

    // If there's only one year to show (the current one), there's no selection to be made. Hide the component.
    if (displayYears.length <= 1) {
        return null;
    }
    
    const currentYearString = getCurrentAcademicYear();

    return (
        <div className="flex items-center space-x-2 bg-slate-100 p-2 rounded-lg border border-border">
            <AcademicCapIcon className="h-5 w-5 text-text-secondary" />
            <Select 
                value={selectedYear} 
                onChange={handleYearChange}
                className="!border-none !shadow-none !ring-0 bg-transparent text-text-primary font-semibold"
                aria-label="Select academic year"
            >
                <option key="current" value="current">
                    {currentYearString} (Current)
                </option>
                {displayYears
                    .filter(year => year !== currentYearString)
                    .map(year => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))
                }
            </Select>
        </div>
    );
};
