import { User, UserRole } from '../types';
import { ErrorHandler, ErrorType, ErrorSeverity } from './errorHandling';

/**
 * Enhanced duplicate detection utility for user management
 * Provides comprehensive duplicate checking with detailed error messages
 */
export class DuplicateDetectionService {
    private existingUsers: User[];
    
    constructor(users: User[]) {
        this.existingUsers = users || [];
    }
    
    /**
     * Update the list of existing users for duplicate checking
     */
    updateExistingUsers(users: User[]): void {
        this.existingUsers = users || [];
    }
    
    /**
     * Check for duplicate email addresses
     */
    checkEmailDuplicate(email: string, excludeUserId?: string): DuplicateCheckResult {
        if (!email || !email.trim()) {
            return { isDuplicate: false };
        }
        
        const normalizedEmail = email.toLowerCase().trim();
        const duplicate = this.existingUsers.find(user => 
            user.email?.toLowerCase().trim() === normalizedEmail && 
            user.id !== excludeUserId
        );
        
        if (duplicate) {
            return {
                isDuplicate: true,
                duplicateUser: duplicate,
                field: 'email',
                message: `Email "${email}" is already registered`,
                userFriendlyMessage: `🚫 Email Already Registered\n\nThe email "${email}" is already in use by ${duplicate.name}.\n\n💡 Solutions:\n• Use a different email address\n• Check if this person is already registered\n• Contact an administrator if you believe this is an error`,
                suggestions: [
                    'Use a different email address',
                    'Check the existing users list',
                    'Contact an administrator for assistance'
                ]
            };
        }
        
        return { isDuplicate: false };
    }
    
    /**
     * Check for duplicate NISN (Student ID) - DISABLED
     * NISN field now accepts any value without restrictions
     */
    checkNisnDuplicate(nisn: string, excludeUserId?: string): DuplicateCheckResult {
        // NISN duplicate checking disabled - accepts any value
        return { isDuplicate: false };
    }
    
    /**
     * Check for duplicate names (with role-specific logic)
     */
    checkNameDuplicate(name: string, role: UserRole, excludeUserId?: string): DuplicateCheckResult {
        if (!name || !name.trim()) {
            return { isDuplicate: false };
        }
        
        const normalizedName = name.toLowerCase().trim();
        
        // For students, check within the same role more strictly
        // For teachers/admins, allow some flexibility
        const duplicates = this.existingUsers.filter(user => {
            if (user.id === excludeUserId) return false;
            
            const userNormalizedName = user.name?.toLowerCase().trim();
            if (userNormalizedName !== normalizedName) return false;
            
            // Strict checking for students
            if (role === UserRole.STUDENT) {
                return user.role === UserRole.STUDENT;
            }
            
            // More flexible for other roles
            return true;
        });
        
        if (duplicates.length > 0) {
            const duplicate = duplicates[0];
            return {
                isDuplicate: true,
                duplicateUser: duplicate,
                field: 'name',
                message: `Name "${name}" is already registered`,
                userFriendlyMessage: `⚠️ Similar Name Found\n\nA user with the name "${name}" already exists (${duplicate.name}).\n\n💡 This might be okay if they are different people, but please verify:\n• Is this the same person?\n• Should you use a different name format?\n• Contact an administrator if unsure`,
                suggestions: [
                    'Verify this is a different person',
                    'Use a more specific name format',
                    'Contact an administrator for guidance'
                ],
                severity: 'warning' // This is a warning, not a hard error
            };
        }
        
        return { isDuplicate: false };
    }
    
    /**
     * Comprehensive duplicate check for a user
     */
    checkAllDuplicates(userData: Partial<User>, excludeUserId?: string): ComprehensiveDuplicateResult {
        const results: DuplicateCheckResult[] = [];
        
        // Check email duplicates
        if (userData.email) {
            const emailResult = this.checkEmailDuplicate(userData.email, excludeUserId);
            if (emailResult.isDuplicate) {
                results.push(emailResult);
            }
        }
        
        // Check NISN duplicates
        if (userData.nisn) {
            const nisnResult = this.checkNisnDuplicate(userData.nisn, excludeUserId);
            if (nisnResult.isDuplicate) {
                results.push(nisnResult);
            }
        }
        
        // Check name duplicates (as warning)
        if (userData.name && userData.role) {
            const nameResult = this.checkNameDuplicate(userData.name, userData.role, excludeUserId);
            if (nameResult.isDuplicate) {
                results.push(nameResult);
            }
        }
        
        const errors = results.filter(r => r.severity !== 'warning');
        const warnings = results.filter(r => r.severity === 'warning');
        
        return {
            hasErrors: errors.length > 0,
            hasWarnings: warnings.length > 0,
            errors,
            warnings,
            allResults: results
        };
    }
    
    /**
     * Get user-friendly error message for duplicate detection results
     */
    getErrorMessage(results: ComprehensiveDuplicateResult): string {
        if (!results.hasErrors && !results.hasWarnings) {
            return '';
        }
        
        const messages: string[] = [];
        
        // Add error messages
        results.errors.forEach(error => {
            if (error.userFriendlyMessage) {
                messages.push(error.userFriendlyMessage);
            }
        });
        
        // Add warning messages
        results.warnings.forEach(warning => {
            if (warning.userFriendlyMessage) {
                messages.push(warning.userFriendlyMessage);
            }
        });
        
        return messages.join('\n\n');
    }
    
    /**
     * Get suggestions for resolving duplicate issues
     */
    getSuggestions(results: ComprehensiveDuplicateResult): string[] {
        const allSuggestions: string[] = [];
        
        results.allResults.forEach(result => {
            if (result.suggestions) {
                allSuggestions.push(...result.suggestions);
            }
        });
        
        // Remove duplicates and return unique suggestions
        return [...new Set(allSuggestions)];
    }
}

/**
 * Result of a single duplicate check
 */
export interface DuplicateCheckResult {
    isDuplicate: boolean;
    duplicateUser?: User;
    field?: string;
    message?: string;
    userFriendlyMessage?: string;
    suggestions?: string[];
    severity?: 'error' | 'warning';
}

/**
 * Result of comprehensive duplicate checking
 */
export interface ComprehensiveDuplicateResult {
    hasErrors: boolean;
    hasWarnings: boolean;
    errors: DuplicateCheckResult[];
    warnings: DuplicateCheckResult[];
    allResults: DuplicateCheckResult[];
}

/**
 * Utility functions for duplicate detection
 */
export const DuplicateDetectionUtils = {
    /**
     * Create a duplicate detection service instance
     */
    createService: (users: User[]) => new DuplicateDetectionService(users),
    
    /**
     * Quick email duplicate check
     */
    isEmailDuplicate: (email: string, users: User[], excludeUserId?: string): boolean => {
        const service = new DuplicateDetectionService(users);
        return service.checkEmailDuplicate(email, excludeUserId).isDuplicate;
    },
    
    /**
     * Quick NISN duplicate check
     */
    isNisnDuplicate: (nisn: string, users: User[], excludeUserId?: string): boolean => {
        const service = new DuplicateDetectionService(users);
        return service.checkNisnDuplicate(nisn, excludeUserId).isDuplicate;
    },
    
    /**
     * Get duplicate user by email
     */
    findDuplicateByEmail: (email: string, users: User[], excludeUserId?: string): User | null => {
        const service = new DuplicateDetectionService(users);
        const result = service.checkEmailDuplicate(email, excludeUserId);
        return result.duplicateUser || null;
    },
    
    /**
     * Get duplicate user by NISN
     */
    findDuplicateByNisn: (nisn: string, users: User[], excludeUserId?: string): User | null => {
        const service = new DuplicateDetectionService(users);
        const result = service.checkNisnDuplicate(nisn, excludeUserId);
        return result.duplicateUser || null;
    }
};

// Export default service
export default DuplicateDetectionService;