"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PasswordManagementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordManagementService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const user_schema_1 = require("../../database/schemas/user.schema");
const password_policy_config_1 = require("../../common/config/password-policy.config");
const audit_service_1 = require("../../common/services/audit.service");
let PasswordManagementService = PasswordManagementService_1 = class PasswordManagementService {
    userModel;
    passwordPolicyConfig;
    auditService;
    logger = new common_1.Logger(PasswordManagementService_1.name);
    commonPasswords = new Set([
        'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
        'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1'
    ]);
    constructor(userModel, passwordPolicyConfig, auditService) {
        this.userModel = userModel;
        this.passwordPolicyConfig = passwordPolicyConfig;
        this.auditService = auditService;
    }
    validatePassword(password, user) {
        return {
            isValid: true,
            errors: [],
            strength: 'strong'
        };
    }
    async hashPassword(password) {
        const rounds = this.passwordPolicyConfig.getBcryptRounds();
        return bcrypt.hash(password, rounds);
    }
    async changePassword(userId, newPassword, adminUserId, reason) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const validation = this.validatePassword(newPassword, user);
        if (!validation.isValid) {
            throw new common_1.BadRequestException({
                message: 'Password validation failed',
                errors: validation.errors
            });
        }
        const hashedPassword = await this.hashPassword(newPassword);
        await this.userModel.findByIdAndUpdate(userId, {
            password: hashedPassword,
            updatedAt: new Date()
        });
        await this.auditService.log({
            action: 'PASSWORD_CHANGE',
            userId: adminUserId,
            targetUserId: user._id.toString(),
            details: {
                targetUserNisn: user.nisn,
                reason: reason || 'Admin password change',
                passwordStrength: validation.strength,
                timestamp: new Date()
            }
        });
        this.logger.log(`Password changed for user ${user.nisn} by admin ${adminUserId}`);
    }
    async generateResetToken(userId) {
        console.log('=== GENERATE RESET TOKEN DEBUG START ===');
        const token = crypto.randomBytes(32).toString('hex');
        console.log('Generated token:', token);
        console.log('Generated token type:', typeof token);
        console.log('Generated token length:', token.length);
        const config = this.passwordPolicyConfig.getPasswordResetConfig();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + config.tokenExpiryMinutes);
        const hashedToken = await bcrypt.hash(token, 10);
        console.log('Hashed token:', hashedToken);
        console.log('Hashed token type:', typeof hashedToken);
        console.log('Hashed token length:', hashedToken.length);
        await this.userModel.findByIdAndUpdate(userId, {
            passwordResetToken: hashedToken,
            passwordResetExpires: expiresAt,
            passwordResetAttempts: 0
        });
        console.log('Token stored in database');
        console.log('=== GENERATE RESET TOKEN DEBUG END ===');
        return token;
    }
    async resetPasswordWithToken(token, newPassword, userId) {
        console.log('=== RESET PASSWORD DEBUG START ===');
        console.log('Input token:', token);
        console.log('Input token type:', typeof token);
        console.log('Input token length:', token.length);
        const user = await this.userModel
            .findOne({
            passwordResetToken: { $ne: null },
            passwordResetExpires: { $gt: new Date() }
        })
            .select('+passwordResetToken +passwordResetExpires +email');
        if (!user) {
            console.log('No user found with valid reset token');
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        console.log('Found user with reset token');
        console.log('Stored hash:', user.passwordResetToken);
        console.log('Stored hash type:', typeof user.passwordResetToken);
        console.log('Stored hash length:', user.passwordResetToken?.length);
        let matches = false;
        try {
            console.log('Attempting bcrypt.compare...');
            matches = await bcrypt.compare(token, user.passwordResetToken);
            console.log('Bcrypt compare result:', matches);
        }
        catch (error) {
            console.error('Bcrypt compare error:', error);
            throw error;
        }
        console.log('=== RESET PASSWORD DEBUG END ===');
        if (!matches) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        if (userId && user._id.toString() !== userId) {
            throw new common_1.ForbiddenException('Token does not match user');
        }
        const validation = this.validatePassword(newPassword, user);
        if (!validation.isValid) {
            throw new common_1.BadRequestException({
                message: 'Password validation failed',
                errors: validation.errors
            });
        }
        const hashedPassword = await this.hashPassword(newPassword);
        await this.userModel.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
            passwordResetAttempts: 0,
            updatedAt: new Date()
        });
        await this.auditService.log({
            action: 'PASSWORD_RESET',
            userId: user._id.toString(),
            details: {
                userNisn: user.nisn,
                resetMethod: 'token',
                passwordStrength: validation.strength,
                timestamp: new Date()
            }
        });
        this.logger.log(`Password reset completed for user ${user.nisn}`);
    }
    generateSecurePassword(length = 16) {
        const policy = this.passwordPolicyConfig.getPasswordPolicy();
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const special = policy.specialChars;
        let charset = '';
        let password = '';
        if (policy.requireUppercase) {
            charset += uppercase;
            password += uppercase[Math.floor(Math.random() * uppercase.length)];
        }
        if (policy.requireLowercase) {
            charset += lowercase;
            password += lowercase[Math.floor(Math.random() * lowercase.length)];
        }
        if (policy.requireNumbers) {
            charset += numbers;
            password += numbers[Math.floor(Math.random() * numbers.length)];
        }
        if (policy.requireSpecialChars) {
            charset += special;
            password += special[Math.floor(Math.random() * special.length)];
        }
        for (let i = password.length; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
    getPasswordPolicy() {
        return this.passwordPolicyConfig.getPasswordPolicy();
    }
};
exports.PasswordManagementService = PasswordManagementService;
exports.PasswordManagementService = PasswordManagementService = PasswordManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        password_policy_config_1.PasswordPolicyConfig,
        audit_service_1.AuditService])
], PasswordManagementService);
//# sourceMappingURL=password-management.service.js.map