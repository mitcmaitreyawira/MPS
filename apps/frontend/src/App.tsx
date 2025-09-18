import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import AdminDashboard from './admin/AdminDashboard';
import TeacherDashboard from './teacher/TeacherDashboard';
import PointsLogger from './components/PointsLogger';
import { UserRole } from './types';
import './index.css';

// Simple navigation component
interface NavigationProps {
  currentView: 'dashboard' | 'points';
  setCurrentView: (view: 'dashboard' | 'points') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setCurrentView }) => {
  const { user, logout, switchUser } = useAuth();
  
  if (!user) return null;
  
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              PointGuard - {user.role === UserRole.ADMIN ? 'Admin' : 'Teacher'} Portal
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Navigation Tabs */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-3 py-1 text-sm rounded ${
                  currentView === 'dashboard'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('points')}
                className={`px-3 py-1 text-sm rounded ${
                  currentView === 'points'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Log Points
              </button>
            </div>
            
            {/* Demo User Switcher */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Demo:</span>
              <button
                onClick={() => switchUser('admin')}
                className={`px-2 py-1 text-xs rounded ${
                  user.role === UserRole.ADMIN 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => switchUser('teacher')}
                className={`px-2 py-1 text-xs rounded ${
                  user.role === UserRole.TEACHER 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Teacher
              </button>
            </div>
            <span className="text-sm text-gray-600">
              {user.firstName} {user.lastName}
            </span>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Main app content based on user role
const AppContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'points'>('dashboard');
  
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              PointGuard
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please log in to access your dashboard
            </p>
          </div>
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <p className="text-center text-gray-500">
              Authentication system would be implemented here.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentView={currentView} setCurrentView={setCurrentView} />
      <main>
        {currentView === 'points' ? (
          <PointsLogger onClose={() => setCurrentView('dashboard')} />
        ) : user.role === UserRole.ADMIN ? (
          <AdminDashboard />
        ) : user.role === UserRole.TEACHER ? (
          <TeacherDashboard />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Access Denied
              </h2>
              <p className="text-gray-600">
                Your account role ({user.role}) does not have access to this portal.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;