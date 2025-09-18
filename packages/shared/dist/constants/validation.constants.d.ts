export declare const VALIDATION_MESSAGES: {
    readonly REQUIRED: "This field is required";
    readonly INVALID_EMAIL: "Please provide a valid email address";
    readonly INVALID_PASSWORD: "Password is accepted";
    readonly PASSWORD_TOO_SHORT: "Password is accepted";
    readonly PASSWORD_TOO_LONG: "Password is accepted";
    readonly PASSWORDS_NOT_MATCH: "Passwords do not match";
    readonly INVALID_PHONE: "Please provide a valid phone number";
    readonly INVALID_URL: "Please provide a valid URL";
    readonly INVALID_DATE: "Please provide a valid date";
    readonly STRING_TOO_SHORT: (min: number) => string;
    readonly STRING_TOO_LONG: (max: number) => string;
    readonly NUMBER_TOO_SMALL: (min: number) => string;
    readonly NUMBER_TOO_LARGE: (max: number) => string;
    readonly INVALID_ENUM: (values: string[]) => string;
};
export declare const REGEX_PATTERNS: {
    readonly EMAIL: RegExp;
    readonly PASSWORD: RegExp;
    readonly PHONE: RegExp;
    readonly ALPHANUMERIC: RegExp;
    readonly ALPHA: RegExp;
    readonly NUMERIC: RegExp;
    readonly USERNAME: RegExp;
    readonly SLUG: RegExp;
    readonly HEX_COLOR: RegExp;
};
//# sourceMappingURL=validation.constants.d.ts.map