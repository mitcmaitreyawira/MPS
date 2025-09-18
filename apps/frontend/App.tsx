
import React, { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './components/ui/Notification';
import Login from './components/auth/Login';
import MainLayout from './components/layout/MainLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import { UserRole } from './types';
import { DashboardSkeleton } from './components/loading/DashboardSkeleton';
import { ShieldCheckIcon } from './assets/icons';

const StudentDashboard = lazy(() => import('./features/student/StudentDashboard'));
const TeacherDashboard = lazy(() => import('./features/teacher/TeacherDashboard'));
const AdminDashboard = lazy(() => import('./features/admin/AdminDashboard'));
const ParentDashboard = lazy(() => import('./features/parent/ParentDashboard'));


const AppContent: React.FC = () => {
    const { user, loading: authLoading } = useAuth();

    // 1. Show a generic, full-page loading state first.
    // This prevents the dashboard skeleton from flashing before login.
    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <ShieldCheckIcon className="h-16 w-16 text-primary animate-pulse" />
                    <p className="text-text-secondary mt-4">Verifying session...</p>
                </div>
            </div>
        );
    }
    
    // 2. After loading is complete, if there is no user, show the standalone Login page.
    if (!user) {
        return <Login />;
    }
    
    // 3. If we are here, loading is done and we have a user. Render the full app with the appropriate dashboard.
    const renderDashboard = () => {
        // Wrap each dashboard in its own Suspense to handle its internal loading state gracefully.
        switch(user.role) {
            case UserRole.STUDENT:
                return <Suspense fallback={<DashboardSkeleton />}><StudentDashboard /></Suspense>;
            case UserRole.PARENT:
                return <Suspense fallback={<DashboardSkeleton />}><ParentDashboard /></Suspense>;
            case UserRole.TEACHER:
            case UserRole.HEAD_OF_CLASS:
                return <Suspense fallback={<DashboardSkeleton />}><TeacherDashboard /></Suspense>;
            case UserRole.ADMIN:
            case UserRole.SUPER_SECRET_ADMIN:
                return <Suspense fallback={<DashboardSkeleton />}><AdminDashboard /></Suspense>;
            default:
                return <div className="text-text-primary">Unknown role. Please contact support.</div>;
        }
    };

    // The main app is wrapped in the MainLayout, which includes the header.
    return (
        <ErrorBoundary>
            <MainLayout>
                {renderDashboard()}
            </MainLayout>
        </ErrorBoundary>
    );
};

const App: React.FC = () => {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: 'url(/asset/Main_Statics_Things_eyak/MW_GEDUNG.webp)'
      }}
    >
      <ErrorBoundary>
        <AuthProvider>
          <DataProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </DataProvider>
        </AuthProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
