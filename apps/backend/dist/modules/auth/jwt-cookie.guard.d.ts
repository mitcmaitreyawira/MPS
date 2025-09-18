import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class JwtCookieAuthGuard implements CanActivate {
    private readonly jwtService;
    private readonly configService;
    private readonly reflector;
    constructor(jwtService: JwtService, configService: ConfigService, reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
//# sourceMappingURL=jwt-cookie.guard.d.ts.map