
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../../assets/icons';
import { Button } from '../../components/ui/Button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 mt-4">
            <div>
                 <p className="text-sm text-text-secondary hidden sm:block">
                    Page <span className="font-medium text-text-primary">{currentPage}</span> of{' '}
                    <span className="font-medium text-text-primary">{totalPages}</span>
                </p>
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="neutral"
                >
                    <ChevronLeftIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                    <span>Previous</span>
                </Button>
                <Button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="neutral"
                >
                    <span>Next</span>
                    <ChevronRightIcon className="h-5 w-5 ml-2" aria-hidden="true" />
                </Button>
            </div>
        </div>
    );
};

export default Pagination;
