import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from '@db/data-access/data-access-user';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UserEntity => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
