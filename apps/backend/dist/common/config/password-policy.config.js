"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordPolicyConfig = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let PasswordPolicyConfig = class PasswordPolicyConfig {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    getPasswordPolicy() {
        return {
            minLength: 1,
            maxLength: 1000,
            requireUppercase: false,
            requireLowercase: false,
            requireNumbers: false,
            requireSpecialChars: false,
            specialChars: this.configService.get('PASSWORD_SPECIAL_CHARS', '!@#$%^&*()_+-=[]{}|;:,.<>?'),
            preventCommonPasswords: false,
            preventUserInfoInPassword: false,
            maxAttempts: this.configService.get('PASSWORD_MAX_ATTEMPTS', 5),
            lockoutDuration: this.configService.get('PASSWORD_LOCKOUT_DURATION', 15),
        };
    }
    getPasswordResetConfig() {
        return {
            tokenExpiryMinutes: this.configService.get('PASSWORD_RESET_TOKEN_EXPIRY', 30),
            maxResetAttempts: this.configService.get('PASSWORD_RESET_MAX_ATTEMPTS', 3),
            cooldownMinutes: this.configService.get('PASSWORD_RESET_COOLDOWN', 60),
            requireEmailVerification: this.configService.get('PASSWORD_RESET_REQUIRE_EMAIL', true),
            notifyUserOnReset: this.configService.get('PASSWORD_RESET_NOTIFY_USER', true),
        };
    }
    getBcryptRounds() {
        const rounds = this.configService.get('BCRYPT_ROUNDS', 12);
        return typeof rounds === 'string' ? parseInt(rounds, 10) : rounds;
    }
};
exports.PasswordPolicyConfig = PasswordPolicyConfig;
exports.PasswordPolicyConfig = PasswordPolicyConfig = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PasswordPolicyConfig);
//# sourceMappingURL=password-policy.config.js.map