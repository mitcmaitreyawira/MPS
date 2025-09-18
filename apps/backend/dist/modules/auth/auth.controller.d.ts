import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { PasswordManagementService } from '../password-management/password-management.service';
import { Model } from 'mongoose';
import { UserDocument } from '../../database/schemas/user.schema';
declare class LoginDto {
    nisn: string;
    password: string;
}
export declare class AuthController {
    private readonly authService;
    private readonly jwtService;
    private readonly configService;
    private readonly usersService;
    private readonly passwordManagementService;
    private readonly userModel;
    private readonly logger;
    constructor(authService: AuthService, jwtService: JwtService, configService: ConfigService, usersService: UsersService, passwordManagementService: PasswordManagementService, userModel: Model<UserDocument>);
    register(_dto: CreateUserDto, _res: Response): Promise<void>;
    login(dto: LoginDto, res: Response): Promise<void>;
    testLogin(body: any): Promise<any>;
    logout(res: Response): Promise<{
        message: string;
    }>;
    profile(req: Request): Promise<{
        id: {};
        nisn: string | undefined;
        firstName: string | undefined;
        lastName: string | undefined;
        roles: string[];
    }>;
    changePassword(req: Request, body: {
        currentPassword: string;
        newPassword: string;
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    requestPasswordReset(body: {
        nisn: string;
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    resetPassword(body: {
        token: string;
        password: string;
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    testDbConnection(): Promise<{
        success: boolean;
        connectionState: import("mongoose").ConnectionStates;
        databaseName: string;
        userFound: boolean;
        userDetails: {
            name: string;
            nisn: string | undefined;
            roles: string[];
        } | null;
        error?: undefined;
        stack?: undefined;
    } | {
        success: boolean;
        error: string;
        stack: string | undefined;
        connectionState?: undefined;
        databaseName?: undefined;
        userFound?: undefined;
        userDetails?: undefined;
    }>;
}
export {};
//# sourceMappingURL=auth.controller.d.ts.map