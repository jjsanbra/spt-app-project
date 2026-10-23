import { BadRequestException, Injectable } from '@nestjs/common';
import { BookingStatus, SportType } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import {
  FacilityAvailabilityResponseDto,
  SlotStatus,
  TimeSlotAvailabilityDto,
} from './dto/facility-availability-response.dto';

@Injectable()
export class FacilitiesAvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera y calcula dinámicamente la disponibilidad de franjas horarias (slots)
   * para una fecha y deporte dados en el club activo.
   */
  async getAvailability(
    clubId: string,
    dateStr: string, // YYYY-MM-DD
    sportType?: SportType,
    userId?: string,
  ): Promise<FacilityAvailabilityResponseDto[]> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      throw new BadRequestException('El formato de fecha debe ser YYYY-MM-DD');
    }

    const [year, month, day] = dateStr.split('-').map(Number);
    const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0 = Domingo, 1 = Lunes...

    const dayStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    // 1. Obtener ajustes del club (horarios de apertura y cierre)
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
    });
    const openingHour = club?.openingHour ?? 8;
    const closingHour = club?.closingHour ?? 23;

    // 2. Obtener pistas activas
    const facilities = await this.prisma.facility.findMany({
      where: {
        clubId,
        isActive: true,
        ...(sportType && { sportType }),
      },
      orderBy: [{ sportType: 'asc' }, { name: 'asc' }],
    });

    if (facilities.length === 0) {
      return [];
    }

    // 3. Obtener bloqueos de pista que intersecten con este día
    const blocks = await this.prisma.facilityBlock.findMany({
      where: {
        clubId,
        startTime: { lte: dayEnd },
        endTime: { gte: dayStart },
      },
    });

    // 4. Obtener reservas confirmadas en este día
    const bookings = await this.prisma.booking.findMany({
      where: {
        clubId,
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING_CONFIRMATION] },
        startTime: { lte: dayEnd },
        endTime: { gte: dayStart },
      },
    });

    // 5. Obtener reglas de tarificación activas del club
    const pricingRules = await this.prisma.pricingRule.findMany({
      where: { clubId },
      orderBy: { priority: 'desc' },
    });

    // 6. Verificar si el usuario consultante es socio del club
    let isMember = false;
    if (userId) {
      const membership = await this.prisma.clubMembership.findFirst({
        where: { clubId, userId, isActive: true },
      });
      isMember = !!membership;
    }

    // 7. Generar slots en memoria para cada instalación
    return facilities.map((facility) => {
      const slotMinutes = facility.defaultSlotMinutes || 60;
      const slots: TimeSlotAvailabilityDto[] = [];

      let currentMinute = openingHour * 60;
      const endMinute = closingHour * 60;

      while (currentMinute + slotMinutes <= endMinute) {
        const slotStartHour = Math.floor(currentMinute / 60);
        const slotStartMin = currentMinute % 60;
        const nextMinute = currentMinute + slotMinutes;
        const slotEndHour = Math.floor(nextMinute / 60);
        const slotEndMin = nextMinute % 60;

        const slotStartTime = new Date(Date.UTC(year, month - 1, day, slotStartHour, slotStartMin, 0));
        const slotEndTime = new Date(Date.UTC(year, month - 1, day, slotEndHour, slotEndMin, 0));

        const startHourText = `${slotStartHour.toString().padStart(2, '0')}:${slotStartMin.toString().padStart(2, '0')}`;
        const endHourText = `${slotEndHour.toString().padStart(2, '0')}:${slotEndMin.toString().padStart(2, '0')}`;

        // Evaluar bloqueos
        const intersectingBlock = blocks.find(
          (b) =>
            b.facilityId === facility.id &&
            b.startTime < slotEndTime &&
            b.endTime > slotStartTime,
        );

        // Evaluar reservas existentes
        const intersectingBooking = bookings.find(
          (b) =>
            b.facilityId === facility.id &&
            b.startTime < slotEndTime &&
            b.endTime > slotStartTime,
        );

        let status = SlotStatus.AVAILABLE;
        let blockedReason: string | null = null;

        if (intersectingBlock) {
          status = SlotStatus.BLOCKED;
          blockedReason = intersectingBlock.title || intersectingBlock.reason || 'Bloqueo temporal';
        } else if (intersectingBooking) {
          status = SlotStatus.OCCUPIED;
        }

        // Calcular precio según PricingRules
        const { price, isPeakHour, lightSurcharge } = this.resolveSlotPrice(
          pricingRules,
          facility.id,
          facility.sportType,
          dayOfWeek,
          startHourText,
          endHourText,
          isMember,
        );

        slots.push({
          startTime: slotStartTime.toISOString(),
          endTime: slotEndTime.toISOString(),
          startHourText,
          endHourText,
          status,
          price,
          isPeakHour,
          lightSurcharge,
          blockedReason,
        });

        currentMinute += slotMinutes;
      }

      return {
        facilityId: facility.id,
        facilityName: facility.name,
        sportType: facility.sportType,
        courtType: facility.courtType,
        surfaceType: facility.surfaceType,
        hasLighting: facility.hasLighting,
        defaultSlotMinutes: facility.defaultSlotMinutes,
        slots,
      };
    });
  }

  /**
   * Resuelve la regla de precio aplicable a una franja
   */
  private resolveSlotPrice(
    rules: any[],
    facilityId: string,
    sportType: SportType,
    dayOfWeek: number,
    startHour: string,
    endHour: string,
    isMember: boolean,
  ): { price: number; isPeakHour: boolean; lightSurcharge: number } {
    const applicableRules = rules
      .filter((rule) => {
        // 1. Coincidencia de instalación o deporte
        if (rule.facilityId && rule.facilityId !== facilityId) return false;
        if (rule.sportType && rule.sportType !== sportType) return false;

        // 2. Coincidencia de día de la semana
        if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
          if (!rule.daysOfWeek.includes(dayOfWeek)) return false;
        }

        // 3. Coincidencia horaria
        if (rule.startTime && rule.endTime) {
          if (startHour < rule.startTime || startHour >= rule.endTime) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const getScopeWeight = (r: typeof a) => {
          if (r.facilityId) return 3;
          if (r.sportType) return 2;
          return 1;
        };
        const weightDiff = getScopeWeight(b) - getScopeWeight(a);
        if (weightDiff !== 0) return weightDiff;
        return (b.priority ?? 1) - (a.priority ?? 1);
      });

    if (applicableRules.length > 0) {
      const rule = applicableRules[0];
      const price = isMember ? Number(rule.memberPrice) : Number(rule.guestPrice);
      return {
        price,
        isPeakHour: rule.isPeakHour,
        lightSurcharge: Number(rule.lightSurcharge || 0),
      };
    }

    // Precio por defecto si no hay regla aplicable
    return {
      price: isMember ? 16.0 : 22.0,
      isPeakHour: false,
      lightSurcharge: 2.5,
    };
  }
}
