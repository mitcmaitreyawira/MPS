/**
 * Validation constants for input validation across the application
 */

// Validation messages
export const VALIDATION_MESSAGES = {
  // Password validation
  PASSWORD_MIN_LENGTH: 'Password is accepted', // No length requirements
  PASSWORD_MAX_LENGTH: 'Password is accepted', // No length requirements
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_WEAK: 'Password is accepted', // No strength requirements
  
  // Name validation
  FIRST_NAME_REQUIRED: 'First name is required',
  FIRST_NAME_MIN_LENGTH: 'First name must be at least 2 characters long',
  FIRST_NAME_MAX_LENGTH: 'First name must not exceed 50 characters',
  LAST_NAME_REQUIRED: 'Last name is required',
  LAST_NAME_MIN_LENGTH: 'Last name must be at least 2 characters long',
  LAST_NAME_MAX_LENGTH: 'Last name must not exceed 50 characters',
  
  // Phone validation
  PHONE_INVALID: 'Please provide a valid phone number',
  
  // URL validation
  URL_INVALID: 'Please provide a valid URL',
  
  // Date validation
  DATE_INVALID: 'Please provide a valid date',
  DATE_FUTURE: 'Date cannot be in the future',
  
  // Generic validation
  FIELD_REQUIRED: 'This field is required',
  FIELD_TOO_SHORT: 'This field is too short',
  FIELD_TOO_LONG: 'This field is too long',
  INVALID_FORMAT: 'Invalid format provided',
  INVALID_ENUM_VALUE: 'Invalid value provided',
  
  // ID validation
  INVALID_ID: 'Invalid ID format',
  ID_REQUIRED: 'ID is required',
};

// Regex patterns
export const VALIDATION_PATTERNS = {
  // Accept any password - no validation requirements
  STRONG_PASSWORD: /^.*$/,
  
  // Phone number (international format)
  PHONE: /^\+?[1-9]\d{1,14}$/,
  
  // Name pattern (letters, spaces, hyphens, apostrophes)
  NAME: /^[a-zA-Z\s\-']{2,50}$/,
  
  // URL pattern
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  
  // MongoDB ObjectId
  MONGO_ID: /^[0-9a-fA-F]{24}$/,
  
  // Username (alphanumeric, underscore, hyphen)
  USERNAME: /^[a-zA-Z0-9_-]{3,30}$/,
  
  // Alphanumeric only
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
};

// Validation limits
export const VALIDATION_LIMITS = {
  PASSWORD_MIN_LENGTH: 1, // Allow any length
  PASSWORD_MAX_LENGTH: 1000, // Very high limit
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  BIO_MAX_LENGTH: 500,
  PHONE_MAX_LENGTH: 20,
  
  // Array limits
  ROLES_MAX_COUNT: 10,
  
  // File sizes (in bytes)
  AVATAR_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Age limits
  MIN_AGE: 13,
  MAX_AGE: 120,
};

// Allowed values
export const ALLOWED_VALUES = {
  GENDERS: ['male', 'female', 'other', 'prefer-not-to-say'],
  THEMES: ['light', 'dark', 'system'],
  LANGUAGES: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'],
  TIMEZONES: [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
    'Australia/Sydney', 'Pacific/Auckland'
  ],
  USER_ROLES: ['admin', 'teacher', 'student', 'parent', 'head_of_class'],
};

// Sanitization options
export const SANITIZATION_OPTIONS = {
  // HTML sanitization
  ALLOW_BASIC_HTML: {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    allowedAttributes: {
      'a': ['href']
    },
    allowedSchemes: ['http', 'https', 'mailto']
  },
  
  // Text sanitization
  STRIP_HTML: {
    allowedTags: [],
    allowedAttributes: {}
  }
};