import React, { createContext, useContext, useId } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon } from '../../assets/icons';
import { designTokens } from './DesignTokens';

interface FormContextValue {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

const FormContext = createContext<FormContextValue | null>(null);

interface FormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
  isSubmitting?: boolean;
  className?: string;
}

export function Form({
  children,
  onSubmit,
  errors = {},
  touched = {},
  isSubmitting = false,
  className = '',
}: FormProps) {
  return (
    <FormContext.Provider value={{ errors, touched, isSubmitting }}>
      <form onSubmit={onSubmit} className={`space-y-6 ${className}`}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

interface FormFieldProps {
  children: React.ReactNode;
  name: string;
  className?: string;
}

export function FormField({ children, name, className = '' }: FormFieldProps) {
  const context = useContext(FormContext);
  const hasError = context?.errors[name] && context?.touched[name];
  const hasSuccess = !context?.errors[name] && context?.touched[name];

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              ...child.props,
              'aria-invalid': hasError,
              'aria-describedby': hasError ? `${name}-error` : undefined,
              className: `${child.props.className || ''} ${
                hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              } ${
                hasSuccess ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''
              }`.trim(),
            });
          }
          return child;
        })}
        
        {/* Status Icons */}
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          </div>
        )}
        {hasSuccess && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {hasError && (
        <p id={`${name}-error`} className="text-sm text-red-600 flex items-center space-x-1">
          <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
          <span>{context?.errors[name]}</span>
        </p>
      )}
    </div>
  );
}

interface FormLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}

export function FormLabel({ children, htmlFor, required, className = '' }: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

interface FormDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function FormDescription({ children, className = '' }: FormDescriptionProps) {
  return (
    <p className={`text-sm text-gray-600 ${className}`}>
      {children}
    </p>
  );
}

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className = '' }: FormSectionProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function FormActions({ children, align = 'right', className = '' }: FormActionsProps) {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={`flex space-x-3 pt-6 border-t border-gray-200 ${alignmentClasses[align]} ${className}`}>
      {children}
    </div>
  );
}

// Form validation utilities
export const validators = {
  required: (value: any) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required';
    }
    return null;
  },
  
  nisn: (value: string) => {
    if (!value) return null;
    if (value.length < 3) {
      return 'NISN must be at least 3 characters long';
    }
    return null;
  },
  
  minLength: (min: number) => (value: string) => {
    if (!value) return null;
    if (value.length < min) {
      return `Must be at least ${min} characters long`;
    }
    return null;
  },
  
  maxLength: (max: number) => (value: string) => {
    if (!value) return null;
    if (value.length > max) {
      return `Must be no more than ${max} characters long`;
    }
    return null;
  },
  
  pattern: (regex: RegExp, message: string) => (value: string) => {
    if (!value) return null;
    if (!regex.test(value)) {
      return message;
    }
    return null;
  },
  
  number: (value: string) => {
    if (!value) return null;
    if (isNaN(Number(value))) {
      return 'Please enter a valid number';
    }
    return null;
  },
  
  min: (min: number) => (value: string) => {
    if (!value) return null;
    const num = Number(value);
    if (isNaN(num) || num < min) {
      return `Must be at least ${min}`;
    }
    return null;
  },
  
  max: (max: number) => (value: string) => {
    if (!value) return null;
    const num = Number(value);
    if (isNaN(num) || num > max) {
      return `Must be no more than ${max}`;
    }
    return null;
  },
};

// Compose multiple validators
export function composeValidators(...validators: Array<(value: any) => string | null>) {
  return (value: any) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
}

// Hook for form validation
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, (value: any) => string | null>
) {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateField = (name: keyof T, value: any) => {
    const validator = validationRules[name];
    if (validator) {
      const error = validator(value);
      setErrors(prev => ({
        ...prev,
        [name]: error || '',
      }));
      return !error;
    }
    return true;
  };

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(key => {
      const validator = validationRules[key];
      const error = validator(values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return isValid;
  };

  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name as string]) {
      validateField(name, value);
    }
  };

  const handleBlur = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, values[name]);
  };

  const handleSubmit = async (onSubmit: (values: T) => Promise<void> | void) => {
    setIsSubmitting(true);
    
    if (validateAll()) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
    validateAll,
    reset,
  };
}

export default Form;