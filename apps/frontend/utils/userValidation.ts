import { User, UserRole } from '../types';

// Validation patterns
const VALIDATION_PATTERNS = {
    NAME: /^[a-zA-Z\s.'-]{2,50}$/,
    USERNAME: /^[a-zA-Z0-9._]{3,30}$/
};

// Error messages
const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  PASSWORD_MISMATCH: 'Passwords do not match',
  NAME_INVALID: 'Name must be 2-50 characters and contain only letters and spaces',
  CLASS_REQUIRED: 'Please select a class for this user role'
};

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'duplicate' | 'mismatch' | 'business';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
  duplicateResults?: any; // kept for backward compatibility
}

export class UserValidationService {
  private existingUsers: User[];

  constructor(existingUsers: User[] = []) {
    this.existingUsers = existingUsers;
  }

  /**
   * Comprehensive validation for user creation/update
   */
  validateUser(
    userData: Partial<User>,
    isUpdate: boolean = false,
    currentUserId?: string,
    confirmPassword?: string
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Required field validation
    this.validateRequiredFields(userData, errors, isUpdate);

    // Format validation
    this.validateFormats(userData, errors);

    // Password validation (only for creation or when password is provided)
    if (!isUpdate || userData.password) {
      this.validatePassword(errors, userData.password, confirmPassword);
    }

    // Business logic validation
    this.validateBusinessRules(userData, errors, warnings);

    // NOTE: Frontend duplicate checks (email/name/NISN) are intentionally disabled
    // to avoid false positives from stale in-memory data. The backend performs
    // authoritative duplicate validation and will return 409 conflicts when needed.

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate required fields based on user role
   */
  private validateRequiredFields(
    userData: Partial<User>,
    errors: ValidationError[],
    isUpdate: boolean
  ): void {
    const requiredFields = ['name', 'role'];
    
    if (!isUpdate) {
      requiredFields.push('password');
    }

    // Class is required for students and head of class
    if (userData.role === UserRole.STUDENT || userData.role === UserRole.HEAD_OF_CLASS) {
      requiredFields.push('classId');
    }

    requiredFields.forEach(field => {
      const value = userData[field as keyof User];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push({
          field,
          message: VALIDATION_MESSAGES.REQUIRED,
          type: 'required'
        });
      }
    });
  }

  /**
   * Validate field formats
   */
  private validateFormats(userData: Partial<User>, errors: ValidationError[]): void {
    // Name format
    if (userData.name && !VALIDATION_PATTERNS.NAME.test(userData.name)) {
      errors.push({
        field: 'name',
        message: VALIDATION_MESSAGES.NAME_INVALID,
        type: 'format'
      });
    }
  }

  /**
   * Validate password strength and confirmation
   */
  private validatePassword(
    errors: ValidationError[],
    password?: string,
    confirmPassword?: string
  ): void {
    if (!password) {
      errors.push({
        field: 'password',
        message: VALIDATION_MESSAGES.REQUIRED,
        type: 'required'
      });
      return;
    }

    // No password strength requirements - accept any password
    // Only check password confirmation match
    if (confirmPassword !== undefined && password !== confirmPassword) {
      errors.push({
        field: 'confirmPassword',
        message: VALIDATION_MESSAGES.PASSWORD_MISMATCH,
        type: 'mismatch'
      });
    }
  }

  /**
   * Validate business rules
   */
  private validateBusinessRules(
    userData: Partial<User>,
    errors: ValidationError[],
    warnings: string[]
  ): void {
    // Class requirement for specific roles
    if (
      (userData.role === UserRole.STUDENT || userData.role === UserRole.HEAD_OF_CLASS) &&
      (!userData.classId || userData.classId.trim() === '')
    ) {
      errors.push({
        field: 'classId',
        message: VALIDATION_MESSAGES.CLASS_REQUIRED,
        type: 'business'
      });
    }

    // Parent role should have children assigned (warning only)
    if (userData.role === UserRole.PARENT && (!userData.childIds || userData.childIds.length === 0)) {
      warnings.push('Consider assigning children to this parent account for proper functionality.');
    }


  }



  /**
   * Real-time field validation for immediate feedback
   */
  validateField(
    fieldName: string,
    value: any,
    userData: Partial<User> = {},
    currentUserId: string | undefined = undefined
  ): ValidationError | null {
    switch (fieldName) {


      case 'nisn':
        // NISN validation removed - accepts any value
        break;

      case 'name':
        if (!value) return { field: 'name', message: VALIDATION_MESSAGES.REQUIRED, type: 'required' };
        if (!VALIDATION_PATTERNS.NAME.test(value)) {
          return { field: 'name', message: VALIDATION_MESSAGES.NAME_INVALID, type: 'format' };
        }
        break;

      case 'password':
        if (!value) return { field: 'password', message: VALIDATION_MESSAGES.REQUIRED, type: 'required' };
        // Allow any password input - no complexity requirements
        break;
    }

    return null;
  }

  /**
   * Update existing users list for potential auxiliary logic
   */
  updateExistingUsers(users: User[]): void {
    this.existingUsers = users;
  }
}

// Export singleton instance
export const userValidationService = new UserValidationService();

// Export utility functions


export const validateNISN = (nisn: string): boolean => {
  // NISN validation removed - accepts any value
  return true;
};

export const validatePassword = (password: string): boolean => {
  // Accept any password - no validation requirements
  return !!password; // Only check that password exists
};