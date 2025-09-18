export declare const API_CONSTANTS: {
    readonly PAGINATION: {
        readonly DEFAULT_PAGE: 1;
        readonly DEFAULT_LIMIT: 10;
        readonly MAX_LIMIT: 100;
    };
    readonly CACHE: {
        readonly DEFAULT_TTL: number;
        readonly LONG_TTL: number;
        readonly SHORT_TTL: 60;
    };
    readonly FILE_UPLOAD: {
        readonly MAX_SIZE: number;
        readonly ALLOWED_TYPES: readonly ["image/jpeg", "image/png", "image/webp", "application/pdf"];
        readonly ALLOWED_EXTENSIONS: readonly [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
    };
    readonly VALIDATION: {
        readonly EMAIL_MAX_LENGTH: 254;
        readonly NAME_MAX_LENGTH: 50;
        readonly BIO_MAX_LENGTH: 500;
        readonly PHONE_MAX_LENGTH: 20;
    };
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly SERVICE_UNAVAILABLE: 503;
};
export declare const API_ROUTES: {
    readonly AUTH: {
        readonly BASE: "/auth";
        readonly LOGIN: "/login";
        readonly REGISTER: "/register";
        readonly LOGOUT: "/logout";
        readonly REFRESH: "/refresh";
        readonly FORGOT_PASSWORD: "/forgot-password";
        readonly RESET_PASSWORD: "/reset-password";
        readonly CHANGE_PASSWORD: "/change-password";
        readonly VERIFY_EMAIL: "/verify-email";
        readonly MFA_SETUP: "/mfa/setup";
        readonly MFA_VERIFY: "/mfa/verify";
        readonly MFA_DISABLE: "/mfa/disable";
    };
    readonly USERS: {
        readonly BASE: "/users";
        readonly PROFILE: "/profile";
        readonly AVATAR: "/avatar";
        readonly PREFERENCES: "/preferences";
    };
    readonly HEALTH: {
        readonly BASE: "/health";
        readonly READINESS: "/ready";
        readonly LIVENESS: "/live";
    };
};
//# sourceMappingURL=api.constants.d.ts.map