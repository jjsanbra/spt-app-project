import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    let tenantId = request.headers['x-tenant-id'] as string;

    if (!tenantId && user.isSuperAdmin) {
      const defaultClub = await this.prisma.club.findFirst({
        where: { isActive: true },
        select: { id: true },
      });
      if (defaultClub) {
        tenantId = defaultClub.id;
      }
    }

    if (!tenantId) {
      throw new BadRequestException(
        'La cabecera "x-tenant-id" es obligatoria para operar sobre este recurso',
      );
    }

    // Si es SuperAdmin global, tiene acceso permitido a cualquier tenant
    if (user.isSuperAdmin) {
      request.tenant = {
        clubId: tenantId,
        role: 'OWNER',
        isSuperAdminOverride: true,
      };
      return true;
    }

    // Validar que el usuario tenga membresía activa en el club
    const membership = await this.prisma.clubMembership.findUnique({
      where: {
        userId_clubId: {
          userId: user.id,
          clubId: tenantId,
        },
      },
      include: {
        club: {
          select: { id: true, isActive: true, name: true },
        },
      },
    });

    if (!membership || !membership.isActive || !membership.club.isActive) {
      throw new ForbiddenException(
        'No posees una membresía activa en el club indicado',
      );
    }

    request.tenant = {
      clubId: tenantId,
      role: membership.role,
      membershipId: membership.id,
    };

    return true;
  }
}
