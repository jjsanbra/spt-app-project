import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ClubRole } from '@prisma/client';

export interface TenantContext {
  clubId: string;
  role: ClubRole;
  membershipId: string;
}

export const CurrentTenant = createParamDecorator(
  (data: keyof TenantContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenant = request.tenant as TenantContext;

    return data ? tenant?.[data] : tenant;
  },
);
