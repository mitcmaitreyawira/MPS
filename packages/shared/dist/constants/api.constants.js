"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ROUTES = exports.HTTP_STATUS = exports.API_CONSTANTS = void 0;
exports.API_CONSTANTS = {
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100,
    },
    CACHE: {
        DEFAULT_TTL: 5 * 60, // 5 minutes
        LONG_TTL: 60 * 60, // 1 hour
        SHORT_TTL: 60, // 1 minute
    },
    FILE_UPLOAD: {
        MAX_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
        ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.pdf'],
    },
    VALIDATION: {
        EMAIL_MAX_LENGTH: 254,
        NAME_MAX_LENGTH: 50,
        BIO_MAX_LENGTH: 500,
        PHONE_MAX_LENGTH: 20,
    },
};
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};
exports.API_ROUTES = {
    AUTH: {
        BASE: '/auth',
        LOGIN: '/login',
        REGISTER: '/register',
        LOGOUT: '/logout',
        REFRESH: '/refresh',
        FORGOT_PASSWORD: '/forgot-password',
        RESET_PASSWORD: '/reset-password',
        CHANGE_PASSWORD: '/change-password',
        VERIFY_EMAIL: '/verify-email',
        MFA_SETUP: '/mfa/setup',
        MFA_VERIFY: '/mfa/verify',
        MFA_DISABLE: '/mfa/disable',
    },
    USERS: {
        BASE: '/users',
        PROFILE: '/profile',
        AVATAR: '/avatar',
        PREFERENCES: '/preferences',
    },
    HEALTH: {
        BASE: '/health',
        READINESS: '/ready',
        LIVENESS: '/live',
    },
};
//# sourceMappingURL=api.constants.js.map