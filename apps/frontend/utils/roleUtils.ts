import { UserRole } from '../types';

export interface User {
  role?: UserRole;
  roles?: string[];
}

/**
 * Check if a user has a specific role
 * Works with both the old single role property and new roles array
 */
export function hasRole(user: User | null | undefined, targetRole: UserRole | string): boolean {
  if (!user) return false;
  
  // Check roles array first (new format)
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.includes(targetRole);
  }
  
  // Fallback to single role property (backward compatibility)
  if (user.role) {
    return user.role === targetRole;
  }
  
  return false;
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(user: User | null | undefined, targetRoles: (UserRole | string)[]): boolean {
  if (!user) return false;
  
  return targetRoles.some(role => hasRole(user, role));
}

/**
 * Get the primary role of a user (first role in array or single role)
 */
export function getPrimaryRole(user: User | null | undefined): UserRole | string | null {
  if (!user) return null;
  
  // Return first role from array (new format)
  if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
    return user.roles[0];
  }
  
  // Fallback to single role property (backward compatibility)
  if (user.role) {
    return user.role;
  }
  
  return null;
}