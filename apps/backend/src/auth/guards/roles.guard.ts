import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClubRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ClubRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenant = request.tenant;

    // SuperAdmin global tiene acceso irrestricto
    if (user?.isSuperAdmin) {
      return true;
    }

    if (!tenant || !tenant.role) {
      throw new ForbiddenException('Se requiere contexto de club para evaluar los permisos');
    }

    const hasRole = requiredRoles.includes(tenant.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Se requiere uno de los siguientes roles en el club: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
