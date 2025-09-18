import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { User, UserRole } from '../../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface PointsLoggerProps {
  onClose?: () => void;
}

const PointsLogger: React.FC<PointsLoggerProps> = ({ onClose }) => {
  const { users, refreshData } = useData();
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [actionType, setActionType] = useState<'reward' | 'violation'>('reward');
  const [points, setPoints] = useState(10);
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    const students = users.filter(user => {
      // Check both roles array and backward-compatible role field
      const userWithRoles = user as any;
      const hasStudentRole = (userWithRoles.roles && userWithRoles.roles.includes(UserRole.STUDENT)) || user.role === UserRole.STUDENT;
      return hasStudentRole && !user.isArchived;
    });
    
    if (!searchTerm) return students;
    
    return students.filter(student => {
      const studentWithProps = student as any;
      const fullName = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim();
      const searchLower = searchTerm.toLowerCase();
      
      return (
        fullName.toLowerCase().includes(searchLower) ||
        (student.firstName && student.firstName.toLowerCase().includes(searchLower)) ||
        (student.lastName && student.lastName.toLowerCase().includes(searchLower)) ||
        (studentWithProps.nisn && studentWithProps.nisn.toLowerCase().includes(searchLower))
      );
    });
  }, [users, searchTerm]);

  // Handle student selection
  const handleStudentSelect = (student: User) => {
    setSelectedStudent(student);
    setSearchTerm(`${student.firstName} ${student.lastName}`);
    setShowDropdown(false);
    setError(null);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
    
    // Clear selected student if search term doesn't match
    if (selectedStudent) {
      const studentName = `${selectedStudent.firstName} ${selectedStudent.lastName}`;
      if (studentName !== value) {
        setSelectedStudent(null);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }
    
    if (!category.trim()) {
      setError('Please enter a category/keyword');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a real app, this would make an API call to log the points
      // Removed console.log to prevent excessive logging
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(`Successfully logged ${actionType === 'reward' ? '+' : '-'}${points} points for ${selectedStudent.firstName} ${selectedStudent.lastName}`);
      
      // Reset form
      setSelectedStudent(null);
      setSearchTerm('');
      setPoints(10);
      setCategory('');
      
      // Note: Removed refreshData() call to prevent refresh loops
      
    } catch (err) {
      setError('Failed to log points. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle manual entry toggle
  const handleManualEntry = () => {
    setSelectedStudent(null);
    setSearchTerm('-- Manual Entry --');
    setShowDropdown(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, 001!
          </h1>
          <div className="flex items-center gap-2 text-blue-600">
            <span className="text-lg">🏆</span>
            <span className="font-semibold">Log Points & Medals</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Action Type Selector */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={actionType === 'reward' ? 'default' : 'outline'}
              onClick={() => setActionType('reward')}
              className="flex-1"
            >
              Reward
            </Button>
            <Button
              type="button"
              variant={actionType === 'violation' ? 'default' : 'outline'}
              onClick={() => setActionType('violation')}
              className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Violation
            </Button>
          </div>

          {/* Student Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student
            </label>
            <div className="relative">
              <Input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search for a student..."
                className="w-full pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => handleStudentSelect(student)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    >
                      <div className="font-medium text-gray-900">
                        {student.firstName} {student.lastName}
                      </div>
                      {student.className && (
                        <div className="text-sm text-gray-500">
                          Class: {student.className}
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">
                    No users found.
                  </div>
                )}
                
                {/* Manual Entry Option */}
                <button
                  type="button"
                  onClick={handleManualEntry}
                  className="w-full px-4 py-2 text-left border-t border-gray-200 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-gray-600"
                >
                  -- Manual Entry --
                </button>
              </div>
            )}
          </div>

          {/* Points Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points
            </label>
            <Input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              min="1"
              max="100"
              className="w-full"
            />
          </div>

          {/* Category/Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category / Keywords
            </label>
            <Input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Homework, Participation"
              className="w-full"
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Logging...' : `Log ${actionType === 'reward' ? 'Reward' : 'Violation'}`}
            </Button>
            {onClose && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PointsLogger;