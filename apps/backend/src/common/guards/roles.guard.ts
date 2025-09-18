import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TokenPayload } from '@template/shared';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Allow public routes to bypass role checks
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: TokenPayload = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check roles
    if (requiredRoles) {
      const hasRole = requiredRoles.some((role) =>
        user.roles?.includes(role),
      );
      
      if (!hasRole) {
        throw new ForbiddenException('Insufficient role permissions');
      }
    }

    // Check permissions
    if (requiredPermissions) {
      const hasPermission = requiredPermissions.some((permission) =>
        user.permissions?.includes(permission),
      );
      
      if (!hasPermission) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    return true;
  }
}