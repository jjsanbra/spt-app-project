import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { ClubSettingsResponseDto } from './dto/club-settings-response.dto';
import { UpdateClubSettingsDto } from './dto/update-club-settings.dto';

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtener ajustes y configuración del club activo
   */
  async getSettings(clubId: string): Promise<ClubSettingsResponseDto> {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      throw new NotFoundException('Club no encontrado');
    }

    return this.mapToResponse(club);
  }

  /**
   * Actualizar ajustes y configuración del club activo
   */
  async updateSettings(clubId: string, dto: UpdateClubSettingsDto): Promise<ClubSettingsResponseDto> {
    const currentClub = await this.prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!currentClub) {
      throw new NotFoundException('Club no encontrado');
    }

    const newOpening = dto.openingHour !== undefined ? dto.openingHour : currentClub.openingHour;
    const newClosing = dto.closingHour !== undefined ? dto.closingHour : currentClub.closingHour;

    if (newOpening >= newClosing) {
      throw new BadRequestException(
        `La hora de apertura (${newOpening}:00) debe ser anterior a la hora de cierre (${newClosing}:00)`,
      );
    }

    const updated = await this.prisma.club.update({
      where: { id: clubId },
      data: {
        name: dto.name,
        description: dto.description,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        postalCode: dto.postalCode,
        openingHour: dto.openingHour,
        closingHour: dto.closingHour,
        slotDurationMinutes: dto.slotDurationMinutes,
        openGameMinNoticeHours: dto.openGameMinNoticeHours,
        paymentMode: dto.paymentMode,
      },
    });

    return this.mapToResponse(updated);
  }

  private mapToResponse(c: any): ClubSettingsResponseDto {
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      email: c.email,
      phone: c.phone,
      address: c.address,
      city: c.city,
      postalCode: c.postalCode,
      openingHour: c.openingHour,
      closingHour: c.closingHour,
      slotDurationMinutes: c.slotDurationMinutes,
      openGameMinNoticeHours: c.openGameMinNoticeHours,
      paymentMode: c.paymentMode,
      isActive: c.isActive,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }
}
