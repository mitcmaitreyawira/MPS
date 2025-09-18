export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please provide a valid email address',
  INVALID_PASSWORD: 'Password is accepted', // No validation requirements
  PASSWORD_TOO_SHORT: 'Password is accepted', // No length requirements
  PASSWORD_TOO_LONG: 'Password is accepted', // No length requirements
  PASSWORDS_NOT_MATCH: 'Passwords do not match',
  INVALID_PHONE: 'Please provide a valid phone number',
  INVALID_URL: 'Please provide a valid URL',
  INVALID_DATE: 'Please provide a valid date',
  STRING_TOO_SHORT: (min: number) => `Must be at least ${min} characters long`,
  STRING_TOO_LONG: (max: number) => `Must not exceed ${max} characters`,
  NUMBER_TOO_SMALL: (min: number) => `Must be at least ${min}`,
  NUMBER_TOO_LARGE: (max: number) => `Must not exceed ${max}`,
  INVALID_ENUM: (values: string[]) => `Must be one of: ${values.join(', ')}`,
} as const;

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^.*$/, // Accept any password - no validation requirements
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  ALPHA: /^[a-zA-Z]+$/,
  NUMERIC: /^\d+$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  SLUG: /^[a-z0-9-]+$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const;