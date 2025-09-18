export interface PasswordPolicyConfig {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumber: boolean;
    requireSpecialChar: boolean;
    maxAgeDays: number;
    historySize: number;
}
declare const _default: (() => PasswordPolicyConfig) & import("@nestjs/config").ConfigFactoryKeyHost<PasswordPolicyConfig>;
export default _default;
//# sourceMappingURL=password-policy.config.d.ts.map