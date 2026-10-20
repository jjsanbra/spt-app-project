import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SportType } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { CreateFacilityBlockDto } from './dto/create-facility-block.dto';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { FacilityBlockResponseDto } from './dto/facility-block-response.dto';
import { FacilityResponseDto } from './dto/facility-response.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';

@Injectable()
export class FacilitiesService {
  constructor(private readonly prisma: PrismaService) {}

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

  async create(clubId: string, dto: CreateFacilityDto): Promise<FacilityResponseDto> {
    return this.prisma.facility.create({
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
  }

  async update(
    clubId: string,
    id: string,
    dto: UpdateFacilityDto,
  ): Promise<FacilityResponseDto> {
    await this.findOne(clubId, id);

    return this.prisma.facility.update({
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
  }

  async remove(clubId: string, id: string): Promise<{ success: boolean; message: string }> {
    await this.findOne(clubId, id);

    // Borrado lógico para preservar integridad de reservas históricas
    await this.prisma.facility.update({
      where: { id },
      data: { isActive: false },
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
  ): Promise<FacilityBlockResponseDto> {
    await this.findOne(clubId, facilityId);

    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (start >= end) {
      throw new BadRequestException('La fecha y hora de fin debe ser posterior a la de inicio');
    }

    return this.prisma.facilityBlock.create({
      data: {
        clubId,
        facilityId,
        title: dto.title,
        reason: dto.reason,
        startTime: start,
        endTime: end,
      },
    });
  }

  async removeBlock(
    clubId: string,
    facilityId: string,
    blockId: string,
  ): Promise<{ success: boolean }> {
    await this.findOne(clubId, facilityId);

    const block = await this.prisma.facilityBlock.findFirst({
      where: { id: blockId, clubId, facilityId },
    });

    if (!block) {
      throw new NotFoundException(`Bloqueo con ID "${blockId}" no encontrado`);
    }

    await this.prisma.facilityBlock.delete({
      where: { id: blockId },
    });

    return { success: true };
  }
}
