import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      // no roles required
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user as { id: string; email: string; roles: Role[] } | undefined;
    if (!user) {
      throw new ForbiddenException('No user in request context');
    }
    const hasRole = (user.roles || []).some((r) => requiredRoles.includes(r));
    if (!hasRole) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
