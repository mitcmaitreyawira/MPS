

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { BellIcon, CheckCircleIcon } from '../../assets/icons';
import { Button } from '../../components/ui/Button';
import TimeAgo from 'javascript-time-ago';

const NotificationBell: React.FC = () => {
    const { user } = useAuth();
    const { notifications, markAsRead } = useData();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Initialize the library only when the component mounts, ensuring the app is set up first.
    // This prevents a race condition that was crashing the app on load.
    const timeAgo = useMemo(() => new TimeAgo('en-US'), []);

    const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleToggle = () => {
        setIsOpen(prev => !prev);
    };

    const handleMarkAllRead = () => {
        const unreadIds = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).map(n => n.id) : [];
        markAsRead(unreadIds);
    };

    const handleMarkOneRead = (id: string, isRead: boolean) => {
        if (!isRead) {
            markAsRead([id]);
        }
    };
    
    const formatTimestamp = (timestamp: Date | string): string => {
        try {
            const date = new Date(timestamp);
            // Ensure date is valid before formatting
            if (isNaN(date.getTime())) {
                console.warn('Invalid timestamp received for notification:', timestamp);
                return 'a moment ago';
            }
            return timeAgo.format(date);
        } catch (error) {
            console.error('Failed to format timestamp:', timestamp, error);
            return 'a moment ago';
        }
    };
    
    if (!user) return null;

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-full text-text-secondary hover:bg-slate-100 hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary"
                aria-label={`Notifications (${unreadCount} unread)`}
            >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-surface" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface rounded-xl shadow-lg border border-border z-20 animate-fade-in-up">
                    <div className="flex justify-between items-center p-4 border-b border-border">
                        <h3 className="font-semibold text-text-primary">Notifications</h3>
                        {unreadCount > 0 && (
                             <Button size="sm" onClick={handleMarkAllRead} className="bg-transparent text-primary hover:bg-primary/10 !p-1.5 !text-xs">
                                Mark all as read
                            </Button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {!Array.isArray(notifications) || notifications.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <CheckCircleIcon className="mx-auto h-12 w-12 text-slate-300" />
                                <h4 className="mt-2 text-sm font-medium text-text-primary">All caught up!</h4>
                                <p className="mt-1 text-xs text-text-secondary">You have no new notifications.</p>
                            </div>
                        ) : (
                            <>
                                {/* Recent Activity Section */}
                                <div className="p-4 bg-blue-50 border-b border-border">
                                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Recent Activity</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2 text-xs text-blue-700">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <span>Points updated • 2 hours ago</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs text-green-700">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span>Quest completed • 1 day ago</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* New Quests Section */}
                                <div className="p-4 bg-purple-50 border-b border-border">
                                    <h4 className="text-sm font-semibold text-purple-900 mb-2">New Quests Available</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2 text-xs text-purple-700">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                            <span>Weekly Challenge Quest • Due in 3 days</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs text-purple-700">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                            <span>Math Competition • Due in 1 week</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Submission Status Section */}
                                <div className="p-4 bg-yellow-50 border-b border-border">
                                    <h4 className="text-sm font-semibold text-yellow-900 mb-2">Submission Status</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2 text-xs text-yellow-700">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                            <span>Assignment pending review • Submitted 1 day ago</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs text-red-700">
                                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            <span>Suspension warning • Review required</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* New Awards Section */}
                                <div className="p-4 bg-green-50 border-b border-border">
                                    <h4 className="text-sm font-semibold text-green-900 mb-2">New Awards</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2 text-xs text-green-700">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span>Achievement Badge earned • Excellence in Math</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs text-green-700">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span>Perfect Attendance Award • Monthly recognition</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Leaderboard Ranking Section */}
                                <div className="p-4 bg-orange-50 border-b border-border">
                                    <h4 className="text-sm font-semibold text-orange-900 mb-2">Leaderboard Update</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2 text-xs text-orange-700">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                            <span>Current ranking: #5 in class • Up 2 positions!</span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs text-orange-700">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                            <span>School ranking: #23 overall • Keep it up!</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <ul className="divide-y divide-border">
                                    {notifications.map(n => (
                                        <li key={n.id} onClick={() => handleMarkOneRead(n.id, n.isRead)} className={`p-4 hover:bg-slate-50 ${!n.isRead ? 'cursor-pointer' : ''}`}>
                                            <div className="flex items-start space-x-3">
                                                {!n.isRead && <div className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" aria-hidden="true" />}
                                                <div className={`flex-grow ${!n.isRead ? '' : 'pl-5'}`}>
                                                    <p className="text-sm text-text-primary">{n.message}</p>
                                                    <p className="text-xs text-text-secondary mt-1">{formatTimestamp(n.timestamp)}</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;