import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { InlineNotification } from '../ui/Notification';

interface LoginError {
  type: 'account_not_found' | 'invalid_password' | 'network_error' | 'server_error' | 'validation_error';
  message: string;
  recoveryActions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

const Login: React.FC = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{identifier?: boolean; password?: boolean}>({});

  const parseLoginError = (err: any): LoginError => {
    const errorMessage = err.message || err.toString();
    const statusCode = err.status || err.response?.status;

    // Clear previous field errors
    setFieldErrors({});

    // Handle specific error cases
    if (statusCode === 401) {
      if (errorMessage.toLowerCase().includes('user not found') || errorMessage.toLowerCase().includes('account not found')) {
        // Highlight the identifier field for user not found
        setFieldErrors({ identifier: true });
        return {
          type: 'account_not_found',
          message: 'No account found with this NISN. Please check your NISN or try a demo account.',
          recoveryActions: [
            {
              label: 'View Demo Accounts',
              onClick: () => setShowDemoAccounts(true)
            },
            {
              label: 'Contact Support',
              onClick: () => window.open('mailto:support@school.com', '_blank')
            }
          ]
        };
      } else {
        // Highlight the password field for wrong password
        setFieldErrors({ password: true });
        return {
          type: 'invalid_password',
          message: 'Incorrect password. Please double-check your password and try again.',
          recoveryActions: [
            {
              label: 'Show Password',
              onClick: () => setShowPassword(true)
            },
            {
              label: 'View Demo Accounts',
              onClick: () => setShowDemoAccounts(true)
            }
          ]
        };
      }
    }

    if (statusCode >= 500) {
      return {
        type: 'server_error',
        message: 'Server error. Please try again later.',
        recoveryActions: [
          {
            label: 'Retry',
            onClick: () => setError(null)
          }
        ]
      };
    }

    if (!navigator.onLine) {
      return {
        type: 'network_error',
        message: 'Network connection error. Please check your internet connection.',
        recoveryActions: [
          {
            label: 'Retry',
            onClick: () => setError(null)
          }
        ]
      };
    }

    return {
      type: 'validation_error',
      message: errorMessage || 'Login failed. Please check your credentials.',
      recoveryActions: [
        {
          label: 'View Demo Accounts',
          onClick: () => setShowDemoAccounts(true)
        }
      ]
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors and field highlights
    setError(null);
    setFieldErrors({});
    
    // Validation with field-specific highlighting
    const newFieldErrors: {identifier?: boolean; password?: boolean} = {};
    if (!identifier.trim()) newFieldErrors.identifier = true;
    if (!password.trim()) newFieldErrors.password = true;
    
    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setError({
        type: 'validation_error',
        message: 'Please fill in all required fields to continue.'
      });
      return;
    }

    setLoading(true);

    try {
      await login(identifier.trim(), password);
    } catch (err: any) {
      setError(parseLoginError(err));
    } finally {
      setLoading(false);
    }
  };

  // Clear field errors when user starts typing
  useEffect(() => {
    if (fieldErrors.identifier && identifier.trim()) {
      setFieldErrors(prev => ({ ...prev, identifier: false }));
    }
  }, [identifier, fieldErrors.identifier]);

  useEffect(() => {
    if (fieldErrors.password && password.trim()) {
      setFieldErrors(prev => ({ ...prev, password: false }));
    }
  }, [password, fieldErrors.password]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url('/asset/Main_Statics_Things_eyak/MW_GEDUNG.webp')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="w-full max-w-sm sm:max-w-md relative z-10 px-4">
          {/* Apple Liquid Glass Card */}
          <div className="bg-white/50 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-white/60 backdrop-saturate-150">
          {/* Logo and Title */}
           <div className="text-center mb-6 sm:mb-8">
             <div className="inline-flex items-center justify-center mb-4 sm:mb-6">
               <img 
                 src="/asset/Main_Statics_Things_eyak/MW_LOGO.webp" 
                 alt="MPS Maitreyawira Logo" 
                 className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain drop-shadow-2xl"
                 loading="eager"
               />
             </div>
             <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 drop-shadow-lg">
               MPS Maitreyawira
             </h1>
             <h2 className="text-lg sm:text-xl font-semibold text-white/90 mb-1">
               Point System
             </h2>
             <p className="text-white/70 text-xs sm:text-sm">
               Login dulu yah - MITC
             </p>
           </div>
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <div className="rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-400/30 p-4">
                   <div className="flex">
                     <div className="ml-3">
                       <h3 className="text-sm font-medium text-red-100">
                         {error.type === 'account_not_found' ? 'Account Not Found' : 
                          error.type === 'invalid_password' ? 'Invalid Password' :
                          error.type === 'network_error' ? 'Connection Error' :
                          error.type === 'server_error' ? 'Server Error' : 'Login Error'}
                       </h3>
                       <div className="mt-2 text-sm text-red-200">
                         <p>{error.message}</p>
                       </div>
                      {error.recoveryActions && (
                        <div className="mt-3">
                          <button
                            onClick={error.recoveryActions[0].onClick}
                            className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg transition-colors"
                          >
                            {error.recoveryActions[0].label}
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setError(null);
                        setFieldErrors({});
                      }}
                      className="ml-auto text-red-400 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {showDemoAccounts && (
              <div className="animate-in slide-in-from-top-2 duration-300 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                    Demo Accounts
                  </h3>
                  <button
                    onClick={() => setShowDemoAccounts(false)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-2 text-xs text-blue-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Admin:</p>
                      <p>NISN: ADMIN001</p>
                      <p>Password: Admin123!</p>
                    </div>
                    <div>
                      <p className="font-medium">Teacher:</p>
                      <p>NISN: TEACH001</p>
                      <p>Password: Teacher123!</p>
                    </div>
                    <div>
                      <p className="font-medium">Student:</p>
                      <p>NISN: STUD001</p>
                      <p>Password: Student123!</p>
                    </div>
                    <div>
                      <p className="font-medium">Parent:</p>
                      <p>NISN: PARENT001</p>
                      <p>Password: Parent123!</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-blue-200">
                    <button
                      onClick={() => {
                        setIdentifier('ADMIN001');
                        setPassword('Admin123!');
                        setShowDemoAccounts(false);
                        setError(null);
                        setFieldErrors({});
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs mr-2 transition-colors"
                    >
                      Use Admin
                    </button>
                    <button
                      onClick={() => {
                        setIdentifier('STUD001');
                        setPassword('Student123!');
                        setShowDemoAccounts(false);
                        setError(null);
                        setFieldErrors({});
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                      Use Student
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-white/90 mb-2">
                NISN
              </label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your NISN"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                  fieldErrors.identifier 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200 text-red-900 placeholder-red-400' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-400 focus:ring-blue-500 focus:border-blue-500'
                }`}
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    fieldErrors.password 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200 text-red-900 placeholder-red-400' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 hover:border-gray-400 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded"
                  disabled={loading}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            
            <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </Button>
          </form>
          

        </div>
      </div>
    </div>
  );
};

export default Login;