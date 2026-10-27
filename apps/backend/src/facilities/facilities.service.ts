import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivityAction, Prisma, SportType } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { BulkCreateFacilityBlockDto } from './dto/bulk-create-facility-block.dto';
import { CreateFacilityBlockDto } from './dto/create-facility-block.dto';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { FacilityBlockResponseDto } from './dto/facility-block-response.dto';
import { FacilityResponseDto } from './dto/facility-response.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';

@Injectable()
export class FacilitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  // ─── Pistas / Instalaciones Deportivas ─────────────────────

  async findAll(
    clubId: string,
    sportType?: SportType,
    isActive?: boolean,
  ): Promise<FacilityResponseDto[]> {
    return this.prisma.facility.findMany({
      where: {
        clubId,
        ...(sportType && { sportType }),
        ...(isActive !== undefined && { isActive }),
      },
      orderBy: [{ sportType: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(clubId: string, id: string): Promise<FacilityResponseDto> {
    const facility = await this.prisma.facility.findFirst({
      where: { id, clubId },
    });

    if (!facility) {
      throw new NotFoundException(`Instalación con ID "${id}" no encontrada en este club`);
    }

    return facility;
  }

  async create(clubId: string, dto: CreateFacilityDto, userId?: string): Promise<FacilityResponseDto> {
    const facility = await this.prisma.facility.create({
      data: {
        clubId,
        name: dto.name,
        sportType: dto.sportType,
        courtType: dto.courtType,
        surfaceType: dto.surfaceType,
        hasLighting: dto.hasLighting ?? true,
        defaultSlotMinutes: dto.defaultSlotMinutes ?? 90,
        minPlayers: dto.minPlayers ?? 4,
        maxPlayers: dto.maxPlayers ?? 4,
        isActive: true,
      },
    });

    this.activityLogsService.log({
      clubId,
      userId,
      action: ActivityAction.FACILITY_CREATED,
      entityType: 'Facility',
      entityId: facility.id,
      summary: `Pista "${facility.name}" creada (${facility.sportType})`,
      metadata: {
        name: facility.name,
        sportType: facility.sportType,
        courtType: facility.courtType,
        defaultSlotMinutes: facility.defaultSlotMinutes,
      },
    });

    return facility;
  }

  async update(
    clubId: string,
    id: string,
    dto: UpdateFacilityDto,
    userId?: string,
  ): Promise<FacilityResponseDto> {
    await this.findOne(clubId, id);

    const updated = await this.prisma.facility.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.sportType && { sportType: dto.sportType }),
        ...(dto.courtType && { courtType: dto.courtType }),
        ...(dto.surfaceType && { surfaceType: dto.surfaceType }),
        ...(dto.hasLighting !== undefined && { hasLighting: dto.hasLighting }),
        ...(dto.defaultSlotMinutes && { defaultSlotMinutes: dto.defaultSlotMinutes }),
        ...(dto.minPlayers !== undefined && { minPlayers: dto.minPlayers }),
        ...(dto.maxPlayers !== undefined && { maxPlayers: dto.maxPlayers }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });

    this.activityLogsService.log({
      clubId,
      userId,
      action: ActivityAction.FACILITY_UPDATED,
      entityType: 'Facility',
      entityId: updated.id,
      summary: `Pista "${updated.name}" actualizada`,
      metadata: { ...dto },
    });

    return updated;
  }

  async remove(clubId: string, id: string, userId?: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.findOne(clubId, id);

    // Borrado lógico para preservar integridad de reservas históricas
    await this.prisma.facility.update({
      where: { id },
      data: { isActive: false },
    });

    this.activityLogsService.log({
      clubId,
      userId,
      action: ActivityAction.FACILITY_DELETED,
      entityType: 'Facility',
      entityId: id,
      summary: `Pista "${existing.name}" desactivada/eliminada`,
    });

    return {
      success: true,
      message: 'Instalación deportiva desactivada con éxito',
    };
  }

  // ─── Bloqueos de Instalación ───────────────────────────────

  async findClubBlocks(
    clubId: string,
    sportType?: SportType,
    facilityId?: string,
  ): Promise<FacilityBlockResponseDto[]> {
    const whereClause: Prisma.FacilityBlockWhereInput = {
      clubId,
      ...(facilityId ? { facilityId } : {}),
      ...(sportType ? { facility: { sportType } } : {}),
    };

    const blocks = await this.prisma.facilityBlock.findMany({
      where: whereClause,
      include: {
        facility: {
          select: {
            name: true,
            sportType: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return blocks.map((b) => ({
      id: b.id,
      clubId: b.clubId,
      facilityId: b.facilityId,
      facilityName: b.facility.name,
      sportType: b.facility.sportType,
      title: b.title,
      reason: b.reason,
      startTime: b.startTime,
      endTime: b.endTime,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));
  }

  async findBlocks(clubId: string, facilityId: string): Promise<FacilityBlockResponseDto[]> {
    const facility = await this.findOne(clubId, facilityId);

    const blocks = await this.prisma.facilityBlock.findMany({
      where: {
        clubId,
        facilityId,
      },
      orderBy: { startTime: 'asc' },
    });

    return blocks.map((b) => ({
      id: b.id,
      clubId: b.clubId,
      facilityId: b.facilityId,
      facilityName: facility.name,
      sportType: facility.sportType,
      title: b.title,
      reason: b.reason,
      startTime: b.startTime,
      endTime: b.endTime,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    }));
  }

  async createBlock(
    clubId: string,
    facilityId: string,
    dto: CreateFacilityBlockDto,
    userId?: string,
  ): Promise<FacilityBlockResponseDto> {
    const facility = await this.findOne(clubId, facilityId);

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (start >= end) {
      throw new BadRequestException('La fecha y hora de fin debe ser posterior a la de inicio');
    }

    const block = await this.prisma.facilityBlock.create({
      data: {
        clubId,
        facilityId,
        title: dto.title,
        reason: dto.reason,
        startTime: start,
        endTime: end,
      },
    });

    this.activityLogsService.log({
      clubId,
      userId,
      action: ActivityAction.FACILITY_BLOCK_CREATED,
      entityType: 'FacilityBlock',
      entityId: block.id,
      summary: `Bloqueo "${block.title}" programado en "${facility.name}"`,
      metadata: {
        facilityId,
        facilityName: facility.name,
        title: block.title,
        reason: block.reason,
        startTime: block.startTime,
        endTime: block.endTime,
      },
    });

    return {
      ...block,
      facilityName: facility.name,
      sportType: facility.sportType,
    };
  }

  async createBulkBlocks(
    clubId: string,
    dto: BulkCreateFacilityBlockDto,
    userId?: string,
  ): Promise<FacilityBlockResponseDto[]> {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (start >= end) {
      throw new BadRequestException('La fecha y hora de fin debe ser posterior a la de inicio');
    }

    const facilities = await this.prisma.facility.findMany({
      where: {
        id: { in: dto.facilityIds },
        clubId,
      },
      select: { id: true, name: true, sportType: true },
    });

    if (facilities.length !== dto.facilityIds.length) {
      throw new BadRequestException('Una o más pistas no existen o no pertenecen a este club');
    }

    const createdBlocks = await this.prisma.$transaction(
      facilities.map((fac) =>
        this.prisma.facilityBlock.create({
          data: {
            clubId,
            facilityId: fac.id,
            title: dto.title,
            reason: dto.reason,
            startTime: start,
            endTime: end,
          },
        }),
      ),
    );

    const facilityMap = new Map(facilities.map((f) => [f.id, f]));

    for (const block of createdBlocks) {
      const fac = facilityMap.get(block.facilityId);
      this.activityLogsService.log({
        clubId,
        userId,
        action: ActivityAction.FACILITY_BLOCK_CREATED,
        entityType: 'FacilityBlock',
        entityId: block.id,
        summary: `Bloqueo "${block.title}" programado en "${fac?.name}"`,
        metadata: {
          facilityId: block.facilityId,
          facilityName: fac?.name,
          title: block.title,
          reason: block.reason,
          startTime: block.startTime,
          endTime: block.endTime,
        },
      });
    }

    return createdBlocks.map((b) => {
      const fac = facilityMap.get(b.facilityId);
      return {
        ...b,
        facilityName: fac?.name,
        sportType: fac?.sportType,
      };
    });
  }

  async removeBlock(
    clubId: string,
    facilityId: string,
    blockId: string,
    userId?: string,
  ): Promise<{ success: boolean }> {
    const facility = await this.findOne(clubId, facilityId);

    const block = await this.prisma.facilityBlock.findFirst({
      where: { id: blockId, clubId, facilityId },
    });

    if (!block) {
      throw new NotFoundException(`Bloqueo con ID "${blockId}" no encontrado`);
    }

    await this.prisma.facilityBlock.delete({
      where: { id: blockId },
    });

    this.activityLogsService.log({
      clubId,
      userId,
      action: ActivityAction.FACILITY_BLOCK_DELETED,
      entityType: 'FacilityBlock',
      entityId: blockId,
      summary: `Bloqueo "${block.title}" eliminado en "${facility.name}"`,
      metadata: {
        facilityId,
        facilityName: facility.name,
        title: block.title,
      },
    });

    return { success: true };
  }

  async removeBlockById(
    clubId: string,
    blockId: string,
    userId?: string,
  ): Promise<{ success: boolean }> {
    const block = await this.prisma.facilityBlock.findFirst({
      where: { id: blockId, clubId },
      include: {
        facility: {
          select: { name: true },
        },
      },
    });

    if (!block) {
      throw new NotFoundException(`Bloqueo con ID "${blockId}" no encontrado`);
    }

    await this.prisma.facilityBlock.delete({
      where: { id: blockId },
    });

    this.activityLogsService.log({
      clubId,
      userId,
      action: ActivityAction.FACILITY_BLOCK_DELETED,
      entityType: 'FacilityBlock',
      entityId: blockId,
      summary: `Bloqueo "${block.title}" eliminado en "${block.facility.name}"`,
      metadata: {
        facilityId: block.facilityId,
        facilityName: block.facility.name,
        title: block.title,
      },
    });

    return { success: true };
  }
}
