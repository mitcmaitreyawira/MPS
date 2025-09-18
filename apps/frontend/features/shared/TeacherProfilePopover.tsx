
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { getAvatarColor, getInitials } from '../../utils/helpers';
import { BookOpenIcon, PhoneIcon } from '../../assets/icons';

interface TeacherProfilePopoverProps {
    teacher: User;
    children: React.ReactNode;
}

const TeacherProfilePopover: React.FC<TeacherProfilePopoverProps> = ({ teacher, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Don't render popover for non-teacher roles
    if (teacher.role === UserRole.STUDENT || teacher.role === UserRole.ADMIN || teacher.role === UserRole.SUPER_SECRET_ADMIN) {
        return <>{children}</>;
    }

    // Effect to handle clicks outside the component to close the popover
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const togglePopover = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsVisible(prev => !prev);
    };

    return (
        <div className="relative inline-block" ref={wrapperRef}>
            <div onClick={togglePopover} className="cursor-pointer">
                {children}
            </div>

            {isVisible && (
                <div 
                    className="absolute z-30 w-64 p-4 mt-2 bg-surface rounded-xl shadow-lg border border-border animate-fade-in-up"
                    style={{ bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '0.5rem' }}
                >
                    <div className="flex items-center space-x-3 mb-3 pb-3 border-b border-border">
                        <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg ${getAvatarColor(teacher.name)}`}>
                            {getInitials(teacher.name)}
                        </div>
                        <div>
                            <p className="font-bold text-text-primary">{teacher.name}</p>
                            <p className="text-xs text-text-secondary capitalize">{teacher.role.replace(/_/g, ' ')}</p>
                        </div>
                    </div>
                    <div className="space-y-2 text-sm text-text-secondary">
                        {teacher.subject && (
                            <div className="flex items-center space-x-2">
                                <BookOpenIcon className="h-4 w-4 text-primary" />
                                <span>{teacher.subject}</span>
                            </div>
                        )}
                        {teacher.contactNumber && (
                            <div className="flex items-center space-x-2">
                                <PhoneIcon className="h-4 w-4 text-primary" />
                                <span>{teacher.contactNumber}</span>
                            </div>
                        )}
                         {!teacher.subject && !teacher.contactNumber && (
                            <p className="text-xs italic">No additional details provided.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherProfilePopover;
