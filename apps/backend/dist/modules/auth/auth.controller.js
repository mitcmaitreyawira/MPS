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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const crypto_1 = __importDefault(require("crypto"));
const auth_service_1 = require("./auth.service");
const users_service_1 = require("../users/users.service");
const create_user_dto_1 = require("../users/dto/create-user.dto");
const jwt_cookie_guard_1 = require("./jwt-cookie.guard");
const roles_guard_1 = require("./roles.guard");
const auth_guard_1 = require("../../common/guards/auth.guard");
const password_management_service_1 = require("../password-management/password-management.service");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../../database/schemas/user.schema");
class LoginDto {
    nisn;
    password;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User NISN', example: '1234567890' }),
    (0, class_validator_1.IsDefined)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "nisn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User password', example: 'password123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class LoginResponseDto {
    user;
    accessToken;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Authenticated user information' }),
    __metadata("design:type", Object)
], LoginResponseDto.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Access token (JWT)', example: 'eyJhbGciOiJI...' }),
    __metadata("design:type", String)
], LoginResponseDto.prototype, "accessToken", void 0);
class ProfileResponseDto {
    id;
    nisn;
    firstName;
    lastName;
    roles;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID', example: '507f1f77bcf86cd799439011' }),
    __metadata("design:type", String)
], ProfileResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User NISN', example: '1234567890' }),
    __metadata("design:type", String)
], ProfileResponseDto.prototype, "nisn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User first name', example: 'Gilbert' }),
    __metadata("design:type", String)
], ProfileResponseDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User last name', example: 'Gilbert' }),
    __metadata("design:type", String)
], ProfileResponseDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User roles', example: ['user'], isArray: true }),
    __metadata("design:type", Array)
], ProfileResponseDto.prototype, "roles", void 0);
class LogoutResponseDto {
    message;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Logout confirmation message', example: 'Logged out' }),
    __metadata("design:type", String)
], LogoutResponseDto.prototype, "message", void 0);
let AuthController = AuthController_1 = class AuthController {
    authService;
    jwtService;
    configService;
    usersService;
    passwordManagementService;
    userModel;
    logger = new common_1.Logger(AuthController_1.name);
    constructor(authService, jwtService, configService, usersService, passwordManagementService, userModel) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.usersService = usersService;
        this.passwordManagementService = passwordManagementService;
        this.userModel = userModel;
    }
    async register(_dto, _res) {
        throw new common_1.ForbiddenException('Public registration is disabled. Please contact an administrator.');
    }
    async login(dto, res) {
        this.logger.log('🔥 AUTH CONTROLLER LOGIN CALLED');
        this.logger.log(`🔥 Login DTO: ${JSON.stringify(dto, null, 2)}`);
        this.logger.log(`🔥 NISN: ${dto.nisn}`);
        this.logger.log(`🔥 Password: ${dto.password}`);
        const user = await this.authService.validate(dto.nisn, dto.password);
        const token = this.authService.signJwt(user);
        res.cookie('access_token', token, this.authService.cookieOptions());
        const csrfToken = crypto_1.default.randomBytes(32).toString('hex');
        const baseCookieOpts = this.authService.cookieOptions();
        res.cookie('csrf_token', csrfToken, {
            ...baseCookieOpts,
            httpOnly: false,
            sameSite: baseCookieOpts.sameSite ?? 'lax',
        });
        res.status(200).json({ accessToken: token, user: this.authService.sanitize(user) });
    }
    async testLogin(body) {
        try {
            const user = await this.authService.validate('ADMIN001', 'Admin123!');
            return { success: true, user: this.authService.sanitize(user) };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async logout(res) {
        const baseCookieOpts = this.authService.cookieOptions();
        res.cookie('access_token', '', { ...baseCookieOpts, maxAge: 0 });
        res.cookie('csrf_token', '', { ...baseCookieOpts, httpOnly: false, maxAge: 0 });
        return { message: 'Logged out' };
    }
    async profile(req) {
        const token = req.cookies?.['access_token'];
        if (!token) {
            throw new common_1.UnauthorizedException('No token');
        }
        const payload = this.jwtService.verify(token, {
            secret: this.configService.get('JWT_ACCESS_SECRET') || 'dev_access_secret',
        });
        const user = await this.userModel.findById(payload.sub).select('-password').exec();
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (!user._id) {
            this.logger.error('User object missing _id field in profile endpoint:', user);
            throw new common_1.UnauthorizedException('Invalid user data');
        }
        return {
            id: user._id,
            nisn: user.nisn,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles || [],
        };
    }
    async changePassword(req, body, res) {
        try {
            const userPayload = req.user;
            console.log('Password change - userPayload:', userPayload);
            if (!userPayload?.sub)
                throw new common_1.UnauthorizedException('Unauthorized');
            console.log('Password change - validating current password for:', userPayload.nisn);
            await this.authService.validate(userPayload.nisn, body.currentPassword).catch((err) => {
                console.error('Password validation failed:', err);
                throw new common_1.UnauthorizedException('Current password is incorrect');
            });
            console.log('Password change - hashing new password');
            const hashed = await this.passwordManagementService.hashPassword(body.newPassword);
            console.log('Password change - updating user:', userPayload.id);
            await this.userModel.findByIdAndUpdate(userPayload.id, {
                password: hashed,
                passwordChangedAt: new Date(),
            });
            console.log('Password change - success');
            return res.status(200).json({ success: true, message: 'Password changed successfully' });
        }
        catch (error) {
            console.error('Password change error - full error:', error);
            if (error instanceof common_1.UnauthorizedException) {
                return res.status(401).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
    async requestPasswordReset(body, res) {
        const user = await this.userModel.findOne({ nisn: body.nisn });
        if (user) {
            await this.passwordManagementService.generateResetToken(user._id.toString());
        }
        return res.status(202).json({ success: true, message: 'If the NISN exists, a reset token has been sent' });
    }
    async resetPassword(body, res) {
        try {
            console.log('Reset password - token:', body.token);
            console.log('Reset password - new password length:', body.password?.length);
            await this.passwordManagementService.resetPasswordWithToken(body.token, body.password);
            console.log('Reset password - success');
            return res.status(200).json({ success: true, message: 'Password reset successful' });
        }
        catch (err) {
            console.error('Reset password error:', err);
            const message = err?.message || 'Invalid or expired reset token';
            const status = err?.status && err.status >= 400 && err.status < 500 ? err.status : 400;
            return res.status(status).json({ success: false, message });
        }
    }
    async testDbConnection() {
        try {
            console.log('=== TEST DB CONNECTION ENDPOINT ===');
            const connectionState = this.userModel.db.readyState;
            console.log('Database connection state:', connectionState);
            console.log('Database name:', this.userModel.db.name);
            const trimmedNisn = '1001234567'.trim();
            console.log('Searching for NISN:', `"${trimmedNisn}"`);
            const user = await this.userModel
                .findOne({ nisn: trimmedNisn })
                .select('+password')
                .exec();
            console.log('User found in test endpoint:', !!user);
            if (user) {
                console.log('User details:', {
                    name: `${user.firstName} ${user.lastName}`,
                    nisn: user.nisn,
                    roles: user.roles,
                    isArchived: user.isArchived
                });
                const bcrypt = require('bcrypt');
                const passwordMatch = await bcrypt.compare('student123', user.password);
                console.log('Password match:', passwordMatch);
            }
            return {
                success: true,
                connectionState,
                databaseName: this.userModel.db.name,
                userFound: !!user,
                userDetails: user ? {
                    name: `${user.firstName} ${user.lastName}`,
                    nisn: user.nisn,
                    roles: user.roles
                } : null
            };
        }
        catch (error) {
            console.error('Test endpoint error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(403),
    (0, swagger_1.ApiOperation)({ summary: 'User registration (disabled)', description: 'Public registration is disabled. Administrators can create accounts via the admin dashboard.' }),
    (0, swagger_1.ApiBody)({ type: create_user_dto_1.CreateUserDto, description: 'User registration payload' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Registration disabled' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'User login', description: 'Authenticate user with NISN and password. Sets HttpOnly cookie for session management.' }),
    (0, swagger_1.ApiBody)({ type: LoginDto, description: 'User login credentials' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful', type: LoginResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('test-login'),
    (0, swagger_1.ApiOperation)({ summary: 'Test login without validation' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "testLogin", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'User logout', description: 'Clear authentication cookies and end user session.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logout successful', type: LogoutResponseDto }),
    (0, swagger_1.ApiCookieAuth)('access_token'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_cookie_guard_1.JwtCookieAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profile retrieved successfully', type: ProfileResponseDto }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "profile", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Change own password' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('request-password-reset'),
    (0, swagger_1.ApiOperation)({ summary: 'Request password reset' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestPasswordReset", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password with token' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Get)('test-db-connection'),
    (0, swagger_1.ApiOperation)({ summary: 'Test database connection and user query' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "testDbConnection", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __param(5, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService,
        config_1.ConfigService,
        users_service_1.UsersService,
        password_management_service_1.PasswordManagementService,
        mongoose_2.Model])
], AuthController);
//# sourceMappingURL=auth.controller.js.map