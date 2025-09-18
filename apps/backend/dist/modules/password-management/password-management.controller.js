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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordManagementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const password_management_service_1 = require("./password-management.service");
const auth_guard_1 = require("../../common/guards/auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const change_password_dto_1 = require("./dto/change-password.dto");
let PasswordManagementController = class PasswordManagementController {
    passwordManagementService;
    constructor(passwordManagementService) {
        this.passwordManagementService = passwordManagementService;
    }
    async changePassword(changePasswordDto, req) {
        await this.passwordManagementService.changePassword(changePasswordDto.userId, changePasswordDto.newPassword, req.user.id, changePasswordDto.reason);
        return {
            success: true,
            message: 'Password changed successfully',
            data: {
                userId: changePasswordDto.userId,
                changedAt: new Date(),
                changedBy: req.user.id,
            },
        };
    }
    async generatePassword(generatePasswordDto) {
        const length = generatePasswordDto.length || 16;
        const password = this.passwordManagementService.generateSecurePassword(length);
        const validation = this.passwordManagementService.validatePassword(password);
        return {
            success: true,
            data: {
                password,
                strength: validation.strength,
                length: password.length,
            },
        };
    }
    async initiateReset(initiateResetDto, req) {
        const token = await this.passwordManagementService.generateResetToken(initiateResetDto.userId);
        const config = this.passwordManagementService.getPasswordPolicy();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 30);
        return {
            success: true,
            message: 'Reset token generated successfully',
            data: {
                token,
                expiresAt,
                userId: initiateResetDto.userId,
            },
        };
    }
    async resetWithToken(resetPasswordDto) {
        await this.passwordManagementService.resetPasswordWithToken(resetPasswordDto.token, resetPasswordDto.newPassword, resetPasswordDto.userId);
        return {
            success: true,
            message: 'Password reset successfully',
        };
    }
    getPasswordPolicy() {
        const policy = this.passwordManagementService.getPasswordPolicy();
        return {
            success: true,
            data: policy,
        };
    }
    async validatePassword(body) {
        if (!body.password) {
            throw new common_1.BadRequestException('Password is required');
        }
        const validation = this.passwordManagementService.validatePassword(body.password, body.userId ? { nisn: body.userId } : undefined);
        return {
            success: true,
            data: validation,
        };
    }
};
exports.PasswordManagementController = PasswordManagementController;
__decorate([
    (0, common_1.Post)('change-password'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Change user password (Admin only)',
        description: 'Allows administrators to securely change any user\'s password with validation and audit logging',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password changed successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Password changed successfully' },
                data: {
                    type: 'object',
                    properties: {
                        userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        changedAt: { type: 'string', format: 'date-time' },
                        changedBy: { type: 'string', example: '507f1f77bcf86cd799439012' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Password validation failed' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Insufficient permissions' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_password_dto_1.ChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], PasswordManagementController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('generate-password'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate secure password',
        description: 'Generates a cryptographically secure password that meets policy requirements',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password generated successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        password: { type: 'string', example: 'Xy9#mK2$pL8@nQ5!' },
                        strength: { type: 'string', enum: ['weak', 'medium', 'strong'], example: 'strong' },
                        length: { type: 'number', example: 16 },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_password_dto_1.GeneratePasswordDto]),
    __metadata("design:returntype", Promise)
], PasswordManagementController.prototype, "generatePassword", null);
__decorate([
    (0, common_1.Post)('initiate-reset'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Initiate password reset',
        description: 'Generates a secure reset token for a user',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Reset token generated successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Reset token generated successfully' },
                data: {
                    type: 'object',
                    properties: {
                        token: { type: 'string', example: 'a1b2c3d4e5f6789012345678901234567890abcdef' },
                        expiresAt: { type: 'string', format: 'date-time' },
                        userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_password_dto_1.InitiateResetDto, Object]),
    __metadata("design:returntype", Promise)
], PasswordManagementController.prototype, "initiateReset", null);
__decorate([
    (0, common_1.Post)('reset-with-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Reset password with token',
        description: 'Resets password using a valid reset token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password reset successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Password reset successfully' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid token or password validation failed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], PasswordManagementController.prototype, "resetWithToken", null);
__decorate([
    (0, common_1.Get)('policy'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get password policy',
        description: 'Returns the current password policy configuration',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password policy retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        minLength: { type: 'number', example: 8 },
                        maxLength: { type: 'number', example: 128 },
                        requireUppercase: { type: 'boolean', example: true },
                        requireLowercase: { type: 'boolean', example: true },
                        requireNumbers: { type: 'boolean', example: true },
                        requireSpecialChars: { type: 'boolean', example: true },
                        specialChars: { type: 'string', example: '!@#$%^&*()_+-=[]{}|;:,.<>?' },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PasswordManagementController.prototype, "getPasswordPolicy", null);
__decorate([
    (0, common_1.Post)('validate-password'),
    (0, roles_decorator_1.Roles)('admin', 'teacher'),
    (0, swagger_1.ApiOperation)({
        summary: 'Validate password',
        description: 'Validates a password against the current policy without storing it',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                password: { type: 'string', example: 'TestPassword123!' },
                userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            },
            required: ['password'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Password validation result',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                data: {
                    type: 'object',
                    properties: {
                        isValid: { type: 'boolean', example: true },
                        errors: { type: 'array', items: { type: 'string' }, example: [] },
                        strength: { type: 'string', enum: ['weak', 'medium', 'strong'], example: 'strong' },
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PasswordManagementController.prototype, "validatePassword", null);
exports.PasswordManagementController = PasswordManagementController = __decorate([
    (0, swagger_1.ApiTags)('Password Management'),
    (0, common_1.Controller)('password-management'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [password_management_service_1.PasswordManagementService])
], PasswordManagementController);
//# sourceMappingURL=password-management.controller.js.map