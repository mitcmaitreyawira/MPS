import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from '@template/shared';

export const CurrentUser = createParamDecorator(
  (data: keyof TokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: TokenPayload = request.user;
    
    return data ? user?.[data] : user;
  },
);