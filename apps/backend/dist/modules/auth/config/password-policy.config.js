"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('passwordPolicy', () => ({
    minLength: 1,
    requireUppercase: false,
    requireLowercase: false,
    requireNumber: false,
    requireSpecialChar: false,
    maxAgeDays: parseInt(process.env.PASSWORD_MAX_AGE_DAYS || '90'),
    historySize: parseInt(process.env.PASSWORD_HISTORY_SIZE || '5'),
}));
//# sourceMappingURL=password-policy.config.js.map