import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

// Icons for better UX feedback
const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const ExclamationCircleIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const LoadingSpinner = () => (
  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

interface FormData {
  username: string;
  password: string;
  nisn: string;
  firstName: string;
  lastName: string;
}

interface OptionalCredentialsFormProps {
  onSubmit?: (data: FormData) => void | Promise<void>;
  className?: string;
}

const OptionalCredentialsForm: React.FC<OptionalCredentialsFormProps> = ({ 
  onSubmit,
  className = ''
}) => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    nisn: '',
    firstName: '',
    lastName: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  const handleInputChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setMessageType(null);

    try {
      // No validation - all fields are optional
      if (onSubmit) {
        await onSubmit(formData);
      }
      setSubmitMessage('🎉 Form submitted successfully! Your information has been saved.');
      setMessageType('success');
      
      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setSubmitMessage('');
        setMessageType(null);
      }, 5000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setSubmitMessage(`❌ Submission failed: ${errorMessage}. Please try again.`);
      setMessageType('error');
      
      // Auto-dismiss error message after 8 seconds
      setTimeout(() => {
        setSubmitMessage('');
        setMessageType(null);
      }, 8000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      username: '',
      password: '',
      nisn: '',
      firstName: '',
      lastName: ''
    });
    setSubmitMessage('');
    setMessageType(null);
  };

  return (
    <div className={`max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-200 hover:shadow-xl ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Optional Credentials Form
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username (Optional)
          </label>
          <Input
            id="username"
            type="text"
            value={formData.username}
            onChange={handleInputChange('username')}
            placeholder="Enter username if desired"
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password (Optional)
          </label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            placeholder="Enter password if desired"
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="nisn" className="block text-sm font-medium text-gray-700 mb-1">
            NISN (Optional)
          </label>
          <Input
            id="nisn"
            type="text"
            value={formData.nisn}
            onChange={handleInputChange('nisn')}
            placeholder="Enter NISN if desired"
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name (Optional)
          </label>
          <Input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            placeholder="Enter first name if desired"
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name (Optional)
          </label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            placeholder="Enter last name if desired"
            className="w-full"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white transition-all duration-200 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner />
                Submitting...
              </>
            ) : (
              'Submit Form'
            )}
          </Button>
          
          <Button
            type="button"
            onClick={handleReset}
            variant="outline"
            disabled={isSubmitting}
            className="flex-1 transition-all duration-200"
          >
            Reset
          </Button>
        </div>

        {submitMessage && (
          <div className={`mt-4 p-4 rounded-lg text-center transition-all duration-300 transform animate-in fade-in slide-in-from-top-2 ${
            messageType === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200 shadow-sm'
              : 'bg-red-50 text-red-800 border border-red-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-center space-x-2">
              {messageType === 'success' ? (
                <CheckCircleIcon />
              ) : (
                <ExclamationCircleIcon />
              )}
              <span className="font-medium">{submitMessage}</span>
            </div>
            {messageType === 'success' && (
              <p className="text-xs text-green-600 mt-2 opacity-75">
                This message will disappear in 5 seconds
              </p>
            )}
            {messageType === 'error' && (
              <p className="text-xs text-red-600 mt-2 opacity-75">
                This message will disappear in 8 seconds
              </p>
            )}
          </div>
        )}
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
          </svg>
          <span>Form Data Preview:</span>
        </h3>
        <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-white p-3 rounded border">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default OptionalCredentialsForm;