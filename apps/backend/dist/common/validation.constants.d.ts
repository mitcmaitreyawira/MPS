export declare const VALIDATION_MESSAGES: {
    PASSWORD_MIN_LENGTH: string;
    PASSWORD_MAX_LENGTH: string;
    PASSWORD_REQUIRED: string;
    PASSWORD_WEAK: string;
    FIRST_NAME_REQUIRED: string;
    FIRST_NAME_MIN_LENGTH: string;
    FIRST_NAME_MAX_LENGTH: string;
    LAST_NAME_REQUIRED: string;
    LAST_NAME_MIN_LENGTH: string;
    LAST_NAME_MAX_LENGTH: string;
    PHONE_INVALID: string;
    URL_INVALID: string;
    DATE_INVALID: string;
    DATE_FUTURE: string;
    FIELD_REQUIRED: string;
    FIELD_TOO_SHORT: string;
    FIELD_TOO_LONG: string;
    INVALID_FORMAT: string;
    INVALID_ENUM_VALUE: string;
    INVALID_ID: string;
    ID_REQUIRED: string;
};
export declare const VALIDATION_PATTERNS: {
    STRONG_PASSWORD: RegExp;
    PHONE: RegExp;
    NAME: RegExp;
    URL: RegExp;
    MONGO_ID: RegExp;
    USERNAME: RegExp;
    ALPHANUMERIC: RegExp;
};
export declare const VALIDATION_LIMITS: {
    PASSWORD_MIN_LENGTH: number;
    PASSWORD_MAX_LENGTH: number;
    NAME_MIN_LENGTH: number;
    NAME_MAX_LENGTH: number;
    BIO_MAX_LENGTH: number;
    PHONE_MAX_LENGTH: number;
    ROLES_MAX_COUNT: number;
    AVATAR_MAX_SIZE: number;
    MIN_AGE: number;
    MAX_AGE: number;
};
export declare const ALLOWED_VALUES: {
    GENDERS: string[];
    THEMES: string[];
    LANGUAGES: string[];
    TIMEZONES: string[];
    USER_ROLES: string[];
};
export declare const SANITIZATION_OPTIONS: {
    ALLOW_BASIC_HTML: {
        allowedTags: string[];
        allowedAttributes: {
            a: string[];
        };
        allowedSchemes: string[];
    };
    STRIP_HTML: {
        allowedTags: never[];
        allowedAttributes: {};
    };
};
//# sourceMappingURL=validation.constants.d.ts.map