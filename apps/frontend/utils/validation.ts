/**
 * Utility functions for input validation
 */

/**
 * Validates if a string is a valid MongoDB ObjectId format
 * @param id - The string to validate
 * @returns boolean - true if valid ObjectId format, false otherwise
 */
export function isValidObjectId(id: string): boolean {
  // ObjectId must be a 24-character hexadecimal string
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
}

/**
 * Validates and sanitizes a class ID input
 * @param classId - The class ID to validate
 * @returns object with validation result and error message
 */
export function validateClassId(classId: string): {
  isValid: boolean;
  error?: string;
  sanitized?: string;
} {
  if (!classId || classId.trim() === '') {
    return {
      isValid: false,
      error: 'Class ID is required'
    };
  }

  const trimmed = classId.trim();
  
  if (!isValidObjectId(trimmed)) {
    return {
      isValid: false,
      error: `Invalid class ID format. Expected a 24-character hexadecimal string, but received: "${trimmed}". Class IDs must be valid MongoDB ObjectIds (e.g., "507f1f77bcf86cd799439011").`
    };
  }

  return {
    isValid: true,
    sanitized: trimmed
  };
}

/**
 * Validates multiple class IDs
 * @param classIds - Array of class IDs to validate
 * @returns object with validation results
 */
export function validateClassIds(classIds: string[]): {
  isValid: boolean;
  errors: string[];
  validIds: string[];
  invalidIds: string[];
} {
  const errors: string[] = [];
  const validIds: string[] = [];
  const invalidIds: string[] = [];

  classIds.forEach((id, index) => {
    const validation = validateClassId(id);
    if (validation.isValid && validation.sanitized) {
      validIds.push(validation.sanitized);
    } else {
      invalidIds.push(id);
      errors.push(`Item ${index + 1}: ${validation.error}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    validIds,
    invalidIds
  };
}

/**
 * Validates user ID format (same as ObjectId validation)
 * @param userId - The user ID to validate
 * @returns object with validation result and error message
 */
export function validateUserId(userId: string): {
  isValid: boolean;
  error?: string;
  sanitized?: string;
} {
  if (!userId || userId.trim() === '') {
    return {
      isValid: false,
      error: 'User ID is required'
    };
  }

  const trimmed = userId.trim();
  
  if (!isValidObjectId(trimmed)) {
    return {
      isValid: false,
      error: `Invalid user ID format. Expected a 24-character hexadecimal string, but received: "${trimmed}". User IDs must be valid MongoDB ObjectIds (e.g., "507f1f77bcf86cd799439011").`
    };
  }

  return {
    isValid: true,
    sanitized: trimmed
  };
}

/**
 * General purpose ObjectId validator with custom entity name
 * @param id - The ID to validate
 * @param entityName - Name of the entity (e.g., 'class', 'user', 'award')
 * @returns object with validation result and error message
 */
export function validateObjectId(id: string, entityName: string = 'entity'): {
  isValid: boolean;
  error?: string;
  sanitized?: string;
} {
  if (!id || id.trim() === '') {
    return {
      isValid: false,
      error: `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} ID is required`
    };
  }

  const trimmed = id.trim();
  
  if (!isValidObjectId(trimmed)) {
    return {
      isValid: false,
      error: `Invalid ${entityName} ID format. Expected a 24-character hexadecimal string, but received: "${trimmed}". ${entityName.charAt(0).toUpperCase() + entityName.slice(1)} IDs must be valid MongoDB ObjectIds (e.g., "507f1f77bcf86cd799439011").`
    };
  }

  return {
    isValid: true,
    sanitized: trimmed
  };
}