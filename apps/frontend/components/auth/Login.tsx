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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your NISN and password
          </p>
        </div>
        
        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <InlineNotification
                  type="error"
                  title={error.type === 'account_not_found' ? 'Account Not Found' : 
                         error.type === 'invalid_password' ? 'Invalid Password' :
                         error.type === 'network_error' ? 'Connection Error' :
                         error.type === 'server_error' ? 'Server Error' : 'Login Error'}
                  message={error.message}
                  onClose={() => {
                    setError(null);
                    setFieldErrors({});
                  }}
                  action={error.recoveryActions?.[0]}
                />
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
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
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
                className={`mt-1 transition-all duration-200 ${
                  fieldErrors.identifier 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                    : 'focus:border-blue-500 focus:ring-blue-200'
                }`}
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
                  className={`mt-1 pr-10 transition-all duration-200 ${
                    fieldErrors.password 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                      : 'focus:border-blue-500 focus:ring-blue-200'
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            
            <div>
              <Button
                type="submit"
                className={`w-full flex justify-center py-3 px-4 transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transform hover:scale-[1.02] active:scale-[0.98]'
                } text-white font-medium rounded-lg shadow-lg`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner className="w-4 h-4 mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                  </>
                )}
              </Button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="text-sm text-gray-600">
              <p className="font-medium">Demo Accounts:</p>
              <div className="mt-2 space-y-1">
                <p>Student: 1001234567 / Student123!</p>
                <p>Teacher: TEACH001 / Teacher123!</p>
                <p>Admin: ADMIN001 / Admin123!</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;