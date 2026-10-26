import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivityAction, SportType } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
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

  async findBlocks(clubId: string, facilityId: string): Promise<FacilityBlockResponseDto[]> {
    await this.findOne(clubId, facilityId);

    return this.prisma.facilityBlock.findMany({
      where: {
        clubId,
        facilityId,
      },
      orderBy: { startTime: 'asc' },
    });
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

    return block;
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
}
