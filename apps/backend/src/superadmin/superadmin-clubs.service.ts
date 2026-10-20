import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClubRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../core/database/prisma.service';
import { CreateClubDto } from './dto/create-club.dto';
import {
  SuperAdminClubListResponseDto,
  SuperAdminClubResponseDto,
} from './dto/superadmin-club-response.dto';
import { UpdateSuperAdminClubDto } from './dto/update-superadmin-club.dto';

@Injectable()
export class SuperAdminClubsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Listar todos los clubes de la plataforma con filtros y conteos agregados
   */
  async findAll(search?: string, isActive?: boolean): Promise<SuperAdminClubListResponseDto> {
    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
        { city: { contains: term, mode: 'insensitive' } },
      ];
    }

    const clubs = await this.prisma.club.findMany({
      where,
      include: {
        _count: {
          select: {
            facilities: true,
            memberships: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = clubs.map((c) => this.mapToResponse(c));

    return {
      items,
      total: items.length,
    };
  }

  /**
   * Obtener detalle de un club por su ID
   */
  async findById(id: string): Promise<SuperAdminClubResponseDto> {
    const club = await this.prisma.club.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            facilities: true,
            memberships: true,
          },
        },
      },
    });

    if (!club) {
      throw new NotFoundException(`Club con ID "${id}" no encontrado`);
    }

    return this.mapToResponse(club);
  }

  /**
   * Crear un nuevo club (Tenant) y asignar opcionalmente al OWNER inicial
   */
  async createClub(dto: CreateClubDto): Promise<SuperAdminClubResponseDto> {
    // 1. Validar horarios
    const opening = dto.openingHour ?? 8;
    const closing = dto.closingHour ?? 23;
    if (opening >= closing) {
      throw new BadRequestException(
        `La hora de apertura (${opening}:00) debe ser menor a la hora de cierre (${closing}:00)`,
      );
    }

    // 2. Validar unicidad del slug
    const normalizedSlug = dto.slug.toLowerCase().trim();
    const existingSlug = await this.prisma.club.findUnique({
      where: { slug: normalizedSlug },
    });

    if (existingSlug) {
      throw new ConflictException(`Ya existe un centro deportivo con el slug "${normalizedSlug}"`);
    }

    // 3. Crear club y membresía en una transacción atómica
    const createdClub = await this.prisma.$transaction(async (tx) => {
      const newClub = await tx.club.create({
        data: {
          name: dto.name.trim(),
          slug: normalizedSlug,
          email: dto.email.toLowerCase().trim(),
          description: dto.description?.trim(),
          phone: dto.phone?.trim(),
          address: dto.address?.trim(),
          city: dto.city?.trim(),
          postalCode: dto.postalCode?.trim(),
          openingHour: opening,
          closingHour: closing,
          slotDurationMinutes: dto.slotDurationMinutes ?? 60,
          openGameMinNoticeHours: dto.openGameMinNoticeHours ?? 2,
          paymentMode: dto.paymentMode,
          isActive: true,
        },
      });

      // Si se especificó un email de propietario, vincularlo o crearlo como OWNER
      if (dto.ownerEmail && dto.ownerEmail.trim()) {
        const ownerEmailNorm = dto.ownerEmail.toLowerCase().trim();
        let ownerUser = await tx.user.findUnique({
          where: { email: ownerEmailNorm },
        });

        if (!ownerUser) {
          const defaultPassword = await bcrypt.hash('SptClubOwner123!', 10);
          ownerUser = await tx.user.create({
            data: {
              email: ownerEmailNorm,
              password: defaultPassword,
              firstName: 'Responsable',
              lastName: dto.name.trim(),
            },
          });
        }

        await tx.clubMembership.create({
          data: {
            clubId: newClub.id,
            userId: ownerUser.id,
            role: ClubRole.OWNER,
          },
        });
      }

      return newClub;
    });

    return this.findById(createdClub.id);
  }

  /**
   * Actualizar datos de un club existente
   */
  async updateClub(id: string, dto: UpdateSuperAdminClubDto): Promise<SuperAdminClubResponseDto> {
    const currentClub = await this.prisma.club.findUnique({
      where: { id },
    });

    if (!currentClub) {
      throw new NotFoundException(`Club con ID "${id}" no encontrado`);
    }

    const opening = dto.openingHour !== undefined ? dto.openingHour : currentClub.openingHour;
    const closing = dto.closingHour !== undefined ? dto.closingHour : currentClub.closingHour;

    if (opening >= closing) {
      throw new BadRequestException(
        `La hora de apertura (${opening}:00) debe ser menor a la hora de cierre (${closing}:00)`,
      );
    }

    if (dto.slug && dto.slug.toLowerCase().trim() !== currentClub.slug) {
      const normalizedSlug = dto.slug.toLowerCase().trim();
      const existingSlug = await this.prisma.club.findUnique({
        where: { slug: normalizedSlug },
      });
      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException(`Ya existe un centro deportivo con el slug "${normalizedSlug}"`);
      }
    }

    await this.prisma.club.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        slug: dto.slug ? dto.slug.toLowerCase().trim() : undefined,
        email: dto.email ? dto.email.toLowerCase().trim() : undefined,
        description: dto.description?.trim(),
        phone: dto.phone?.trim(),
        address: dto.address?.trim(),
        city: dto.city?.trim(),
        postalCode: dto.postalCode?.trim(),
        openingHour: dto.openingHour,
        closingHour: dto.closingHour,
        slotDurationMinutes: dto.slotDurationMinutes,
        openGameMinNoticeHours: dto.openGameMinNoticeHours,
        paymentMode: dto.paymentMode,
        isActive: dto.isActive,
      },
    });

    return this.findById(id);
  }

  /**
   * Alternar estado de activación (Activo / Inactivo)
   */
  async toggleStatus(id: string): Promise<SuperAdminClubResponseDto> {
    const currentClub = await this.prisma.club.findUnique({
      where: { id },
    });

    if (!currentClub) {
      throw new NotFoundException(`Club con ID "${id}" no encontrado`);
    }

    await this.prisma.club.update({
      where: { id },
      data: { isActive: !currentClub.isActive },
    });

    return this.findById(id);
  }

  private mapToResponse(club: any): SuperAdminClubResponseDto {
    return {
      id: club.id,
      name: club.name,
      slug: club.slug,
      description: club.description || undefined,
      email: club.email,
      phone: club.phone || undefined,
      address: club.address || undefined,
      city: club.city || undefined,
      postalCode: club.postalCode || undefined,
      openingHour: club.openingHour,
      closingHour: club.closingHour,
      slotDurationMinutes: club.slotDurationMinutes,
      openGameMinNoticeHours: club.openGameMinNoticeHours,
      paymentMode: club.paymentMode,
      isActive: club.isActive,
      facilitiesCount: club._count?.facilities ?? 0,
      membersCount: club._count?.memberships ?? 0,
      createdAt: club.createdAt,
      updatedAt: club.updatedAt,
    };
  }
}
