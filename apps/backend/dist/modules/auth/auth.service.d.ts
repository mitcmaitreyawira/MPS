import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../../database/schemas/user.schema';
export declare class AuthService {
    private readonly userModel;
    private readonly jwtService;
    private readonly configService;
    private readonly logger;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService, configService: ConfigService);
    validate(nisn: string, password: string): Promise<UserDocument>;
    signJwt(user: User): string;
    sanitize(user: any): Record<string, any>;
    cookieOptions(): {
        [key: string]: any;
    };
}
//# sourceMappingURL=auth.service.d.ts.map