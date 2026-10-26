import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivityAction, ClubRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../core/database/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ClubMemberResponseDto } from './dto/club-member-response.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { UpdateMemberStatusDto } from './dto/update-member-status.dto';

@Injectable()
export class ClubsMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  /**
   * Listar todos los miembros pertenecientes a un club
   */
  async findAll(
    clubId: string,
    role?: ClubRole,
    search?: string,
    isActive?: boolean,
  ): Promise<ClubMemberResponseDto[]> {
    const where: any = { clubId };

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search && search.trim().length > 0) {
      const term = search.trim();
      where.user = {
        OR: [
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
        ],
      };
    }

    const memberships = await this.prisma.clubMembership.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
    });

    return memberships.map((m) => this.mapToResponse(m));
  }

  /**
   * Invitar o asociar a un usuario como socio del club
   */
  async invite(clubId: string, dto: InviteMemberDto): Promise<ClubMemberResponseDto> {
    const email = dto.email.trim().toLowerCase();

    // 1. Buscar si el usuario ya existe en el sistema
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    // 2. Si no existe, crear el usuario con contraseña aleatoria temporal
    if (!user) {
      const tempPasswordHash = await bcrypt.hash(Math.random().toString(36), 10);
      const namePart = email.split('@')[0];
      user = await this.prisma.user.create({
        data: {
          email,
          password: tempPasswordHash,
          firstName: namePart,
          lastName: 'Socio',
        },
      });
    }

    // 3. Comprobar si ya es miembro de este club
    const existingMembership = await this.prisma.clubMembership.findUnique({
      where: {
        userId_clubId: {
          userId: user.id,
          clubId,
        },
      },
    });

    if (existingMembership) {
      throw new ConflictException('El usuario ya forma parte de este club');
    }

    // 4. Crear la membresía
    const membership = await this.prisma.clubMembership.create({
      data: {
        clubId,
        userId: user.id,
        role: dto.role ?? ClubRole.MEMBER,
        memberNumber: dto.memberNumber ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    this.activityLogsService.log({
      clubId,
      action: ActivityAction.MEMBER_ROLE_CHANGED,
      entityType: 'ClubMembership',
      entityId: membership.id,
      summary: `Nuevo socio invitado/asociado: ${membership.user.email} con rol ${membership.role}`,
      metadata: { email: membership.user.email, role: membership.role },
    });

    return this.mapToResponse(membership);
  }

  /**
   * Modificar el rol de un miembro
   */
  async updateRole(
    clubId: string,
    membershipId: string,
    dto: UpdateMemberRoleDto,
  ): Promise<ClubMemberResponseDto> {
    const membership = await this.findMembershipOrThrow(clubId, membershipId);

    // Validación de protección de OWNER
    if (membership.role === ClubRole.OWNER && dto.role !== ClubRole.OWNER) {
      await this.assertClubHasOtherOwners(clubId, membership.id);
    }

    const updated = await this.prisma.clubMembership.update({
      where: { id: membership.id },
      data: { role: dto.role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    this.activityLogsService.log({
      clubId,
      action: ActivityAction.MEMBER_ROLE_CHANGED,
      entityType: 'ClubMembership',
      entityId: updated.id,
      summary: `Rol de socio ${updated.user.email} actualizado de ${membership.role} a ${updated.role}`,
      metadata: {
        previousRole: membership.role,
        newRole: updated.role,
        memberEmail: updated.user.email,
      },
    });

    return this.mapToResponse(updated);
  }

  /**
   * Activar o desactivar una membresía
   */
  async updateStatus(
    clubId: string,
    membershipId: string,
    dto: UpdateMemberStatusDto,
  ): Promise<ClubMemberResponseDto> {
    const membership = await this.findMembershipOrThrow(clubId, membershipId);

    if (membership.role === ClubRole.OWNER && !dto.isActive) {
      await this.assertClubHasOtherOwners(clubId, membership.id);
    }

    const updated = await this.prisma.clubMembership.update({
      where: { id: membership.id },
      data: { isActive: dto.isActive },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
    });

    this.activityLogsService.log({
      clubId,
      action: ActivityAction.MEMBER_STATUS_CHANGED,
      entityType: 'ClubMembership',
      entityId: updated.id,
      summary: `Estado de membresía para ${updated.user.email}: ${updated.isActive ? 'Activo' : 'Inactivo'}`,
      metadata: { isActive: updated.isActive, memberEmail: updated.user.email },
    });

    return this.mapToResponse(updated);
  }

  /**
   * Eliminar la membresía de un usuario en el club
   */
  async remove(clubId: string, membershipId: string): Promise<{ success: boolean; message: string }> {
    const membership = await this.findMembershipOrThrow(clubId, membershipId);

    if (membership.role === ClubRole.OWNER) {
      await this.assertClubHasOtherOwners(clubId, membership.id);
    }

    await this.prisma.clubMembership.delete({
      where: { id: membership.id },
    });

    this.activityLogsService.log({
      clubId,
      action: ActivityAction.MEMBER_STATUS_CHANGED,
      entityType: 'ClubMembership',
      entityId: membershipId,
      summary: `Membresía eliminada para el usuario ${membership.userId}`,
    });

    return {
      success: true,
      message: 'Membresía eliminada correctamente',
    };
  }

  // ─── Helpers privados ─────────────────────────────────────

  private async findMembershipOrThrow(clubId: string, membershipId: string) {
    const membership = await this.prisma.clubMembership.findFirst({
      where: { id: membershipId, clubId },
    });

    if (!membership) {
      throw new NotFoundException('Membresía no encontrada en este club');
    }

    return membership;
  }

  private async assertClubHasOtherOwners(clubId: string, excludedMembershipId: string): Promise<void> {
    const ownersCount = await this.prisma.clubMembership.count({
      where: {
        clubId,
        role: ClubRole.OWNER,
        id: { not: excludedMembershipId },
        isActive: true,
      },
    });

    if (ownersCount === 0) {
      throw new BadRequestException(
        'No se puede modificar ni dar de baja al único propietario (OWNER) activo del club',
      );
    }
  }

  private mapToResponse(m: any): ClubMemberResponseDto {
    return {
      id: m.id,
      userId: m.userId,
      clubId: m.clubId,
      role: m.role,
      walletBalance: Number(m.walletBalance),
      memberNumber: m.memberNumber,
      isActive: m.isActive,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      user: {
        id: m.user.id,
        email: m.user.email,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        phone: m.user.phone,
        avatarUrl: m.user.avatarUrl,
      },
    };
  }
}
