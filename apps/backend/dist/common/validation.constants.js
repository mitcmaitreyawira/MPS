"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SANITIZATION_OPTIONS = exports.ALLOWED_VALUES = exports.VALIDATION_LIMITS = exports.VALIDATION_PATTERNS = exports.VALIDATION_MESSAGES = void 0;
exports.VALIDATION_MESSAGES = {
    PASSWORD_MIN_LENGTH: 'Password is accepted',
    PASSWORD_MAX_LENGTH: 'Password is accepted',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_WEAK: 'Password is accepted',
    FIRST_NAME_REQUIRED: 'First name is required',
    FIRST_NAME_MIN_LENGTH: 'First name must be at least 2 characters long',
    FIRST_NAME_MAX_LENGTH: 'First name must not exceed 50 characters',
    LAST_NAME_REQUIRED: 'Last name is required',
    LAST_NAME_MIN_LENGTH: 'Last name must be at least 2 characters long',
    LAST_NAME_MAX_LENGTH: 'Last name must not exceed 50 characters',
    PHONE_INVALID: 'Please provide a valid phone number',
    URL_INVALID: 'Please provide a valid URL',
    DATE_INVALID: 'Please provide a valid date',
    DATE_FUTURE: 'Date cannot be in the future',
    FIELD_REQUIRED: 'This field is required',
    FIELD_TOO_SHORT: 'This field is too short',
    FIELD_TOO_LONG: 'This field is too long',
    INVALID_FORMAT: 'Invalid format provided',
    INVALID_ENUM_VALUE: 'Invalid value provided',
    INVALID_ID: 'Invalid ID format',
    ID_REQUIRED: 'ID is required',
};
exports.VALIDATION_PATTERNS = {
    STRONG_PASSWORD: /^.*$/,
    PHONE: /^\+?[1-9]\d{1,14}$/,
    NAME: /^[a-zA-Z\s\-']{2,50}$/,
    URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    MONGO_ID: /^[0-9a-fA-F]{24}$/,
    USERNAME: /^[a-zA-Z0-9_-]{3,30}$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
};
exports.VALIDATION_LIMITS = {
    PASSWORD_MIN_LENGTH: 1,
    PASSWORD_MAX_LENGTH: 1000,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    BIO_MAX_LENGTH: 500,
    PHONE_MAX_LENGTH: 20,
    ROLES_MAX_COUNT: 10,
    AVATAR_MAX_SIZE: 5 * 1024 * 1024,
    MIN_AGE: 13,
    MAX_AGE: 120,
};
exports.ALLOWED_VALUES = {
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
exports.SANITIZATION_OPTIONS = {
    ALLOW_BASIC_HTML: {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        allowedAttributes: {
            'a': ['href']
        },
        allowedSchemes: ['http', 'https', 'mailto']
    },
    STRIP_HTML: {
        allowedTags: [],
        allowedAttributes: {}
    }
};
//# sourceMappingURL=validation.constants.js.map