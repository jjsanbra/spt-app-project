import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import {
  ClubDashboardMonthDto,
  ClubDashboardResponseDto,
  ClubDashboardTodayDto,
  ClubOccupancyTrendDto,
  ClubOperationalDashboardResponseDto,
  ClubRevenueBySportDto,
} from './dto/club-dashboard-response.dto';
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

  /**
   * Obtener dashboard analítico completo para Owners y Administradores
   */
  async getDashboard(clubId: string): Promise<ClubDashboardResponseDto> {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      include: {
        facilities: {
          where: { isActive: true },
        },
      },
    });

    if (!club) {
      throw new NotFoundException('Club no encontrado');
    }

    const today = await this.calculateTodayMetrics(clubId, club);
    const month = await this.calculateMonthMetrics(clubId, club);
    const revenueBySport = await this.calculateRevenueBySport(clubId);
    const occupancyTrend = await this.calculateOccupancyTrend(clubId, club);

    return {
      today,
      month,
      revenueBySport,
      occupancyTrend,
    };
  }

  /**
   * Obtener dashboard operativo de hoy para Staff / Recepción
   */
  async getOperationalDashboard(clubId: string): Promise<ClubOperationalDashboardResponseDto> {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
      include: {
        facilities: {
          where: { isActive: true },
        },
      },
    });

    if (!club) {
      throw new NotFoundException('Club no encontrado');
    }

    const today = await this.calculateTodayMetrics(clubId, club);
    return { today };
  }

  private async calculateTodayMetrics(clubId: string, club: any): Promise<ClubDashboardTodayDto> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const in3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const activeCourtsCount = club.facilities?.length || 0;

    // Reservas de hoy
    const todayBookings = await this.prisma.booking.findMany({
      where: {
        clubId,
        startTime: { gte: todayStart, lte: todayEnd },
        status: { not: 'CANCELLED' },
      },
      select: {
        id: true,
        facilityId: true,
        startTime: true,
        endTime: true,
        payments: {
          select: {
            status: true,
          },
        },
      },
    });

    const totalBookings = todayBookings.length;
    const pendingPaymentsCount = todayBookings.filter(
      (b) => b.payments.length === 0 || b.payments.some((p) => p.status === 'PENDING'),
    ).length;

    // Bloqueos activos hoy
    const activeBlocksCount = await this.prisma.facilityBlock.count({
      where: {
        clubId,
        startTime: { lte: todayEnd },
        endTime: { gte: todayStart },
      },
    });

    // Pistas ocupadas en las próximas 3 horas (reservas o bloqueos entre now y in3Hours)
    const bookingsIn3Hours = todayBookings.filter((b) => b.startTime <= in3Hours && b.endTime >= now);
    const blocksIn3Hours = await this.prisma.facilityBlock.findMany({
      where: {
        clubId,
        startTime: { lte: in3Hours },
        endTime: { gte: now },
      },
      select: { facilityId: true },
    });

    const busyFacilityIds = new Set([
      ...bookingsIn3Hours.map((b) => b.facilityId),
      ...blocksIn3Hours.map((b) => b.facilityId),
    ]);

    const availableCourtsNext3Hours = Math.max(0, activeCourtsCount - busyFacilityIds.size);

    // Ocupación diaria estimada
    const openingHour = club.openingHour ?? 8;
    const closingHour = club.closingHour ?? 23;
    const slotDuration = club.slotDurationMinutes ?? 90;
    const slotsPerHour = 60 / slotDuration;
    const totalPossibleSlotsToday = activeCourtsCount * ((closingHour - openingHour) * slotsPerHour);

    const occupancyPercent =
      totalPossibleSlotsToday > 0
        ? Math.min(100, Math.round((totalBookings / totalPossibleSlotsToday) * 1000) / 10)
        : 0;

    return {
      totalBookings,
      occupancyPercent,
      availableCourtsNext3Hours,
      pendingPaymentsCount,
      activeBlocksCount,
    };
  }

  private async calculateMonthMetrics(clubId: string, club: any): Promise<ClubDashboardMonthDto> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Reservas de este mes
    const currentMonthBookings = await this.prisma.booking.findMany({
      where: {
        clubId,
        startTime: { gte: monthStart },
        status: { not: 'CANCELLED' },
      },
      select: {
        totalPrice: true,
      },
    });

    const totalRevenue = currentMonthBookings.reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
    const averageTicketPrice =
      currentMonthBookings.length > 0
        ? Math.round((totalRevenue / currentMonthBookings.length) * 100) / 100
        : 0;

    // Facturación mes anterior para delta
    const prevMonthBookings = await this.prisma.booking.findMany({
      where: {
        clubId,
        startTime: { gte: prevMonthStart, lte: prevMonthEnd },
        status: { not: 'CANCELLED' },
      },
      select: {
        totalPrice: true,
      },
    });

    const prevRevenue = prevMonthBookings.reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
    const revenueGrowthPercent =
      prevRevenue > 0
        ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 1000) / 10
        : totalRevenue > 0
          ? 100
          : 0;

    // Nuevas altas de socios este mes
    const newMembersCount = await this.prisma.clubMembership.count({
      where: {
        clubId,
        isActive: true,
        createdAt: { gte: monthStart },
      },
    });

    // Ocupación mensual estimada
    const activeCourtsCount = club.facilities?.length || 1;
    const daysElapsed = Math.max(1, now.getDate());
    const openingHour = club.openingHour ?? 8;
    const closingHour = club.closingHour ?? 23;
    const slotDuration = club.slotDurationMinutes ?? 90;
    const slotsPerDay = activeCourtsCount * ((closingHour - openingHour) * (60 / slotDuration));
    const totalSlotsElapsed = slotsPerDay * daysElapsed;

    const occupancyPercent =
      totalSlotsElapsed > 0
        ? Math.min(100, Math.round((currentMonthBookings.length / totalSlotsElapsed) * 1000) / 10)
        : 0;

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      revenueGrowthPercent,
      occupancyPercent,
      averageTicketPrice,
      newMembersCount,
    };
  }

  private async calculateRevenueBySport(clubId: string): Promise<ClubRevenueBySportDto[]> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    const bookings = await this.prisma.booking.findMany({
      where: {
        clubId,
        startTime: { gte: monthStart },
        status: { not: 'CANCELLED' },
      },
      select: {
        totalPrice: true,
        facility: {
          select: {
            sportType: true,
          },
        },
      },
    });

    const totalsBySport = new Map<string, number>();
    let grandTotal = 0;

    for (const b of bookings) {
      const sport = b.facility?.sportType || 'OTHER';
      const price = Number(b.totalPrice || 0);
      totalsBySport.set(sport, (totalsBySport.get(sport) || 0) + price);
      grandTotal += price;
    }

    const sportLabels: Record<string, string> = {
      PADEL: 'Pádel',
      TENNIS: 'Tenis',
      PICKLEBALL: 'Pickleball',
      SQUASH: 'Squash',
      BADMINTON: 'Bádminton',
      OTHER: 'Otros',
    };

    const result: ClubRevenueBySportDto[] = [];
    totalsBySport.forEach((amount, sportType) => {
      const percent = grandTotal > 0 ? Math.round((amount / grandTotal) * 1000) / 10 : 0;
      result.push({
        sportType,
        label: sportLabels[sportType] || sportType,
        amount: Math.round(amount * 100) / 100,
        percent,
      });
    });

    // Si no hay datos, devolver al menos Pádel y Tenis en cero para visualización limpia
    if (result.length === 0) {
      return [
        { sportType: 'PADEL', label: 'Pádel', amount: 0, percent: 0 },
        { sportType: 'TENNIS', label: 'Tenis', amount: 0, percent: 0 },
      ];
    }

    return result.sort((a, b) => b.amount - a.amount);
  }

  private async calculateOccupancyTrend(clubId: string, club: any): Promise<ClubOccupancyTrendDto[]> {
    const now = new Date();
    const result: ClubOccupancyTrendDto[] = [];
    const activeCourtsCount = club.facilities?.length || 1;
    const openingHour = club.openingHour ?? 8;
    const closingHour = club.closingHour ?? 23;
    const slotDuration = club.slotDurationMinutes ?? 90;
    const dailySlots = activeCourtsCount * ((closingHour - openingHour) * (60 / slotDuration));

    // Últimos 14 días
    for (let i = 13; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
      const dayEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

      const bookingsCount = await this.prisma.booking.count({
        where: {
          clubId,
          startTime: { gte: dayStart, lte: dayEnd },
          status: { not: 'CANCELLED' },
        },
      });

      const occupancyPercent =
        dailySlots > 0 ? Math.min(100, Math.round((bookingsCount / dailySlots) * 1000) / 10) : 0;

      const dateStr = dayStart.toISOString().split('T')[0];
      const dayNumber = targetDate.getDate();
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const label = `${dayNumber} ${monthNames[targetDate.getMonth()]}`;

      result.push({
        date: dateStr,
        label,
        bookingsCount,
        occupancyPercent,
      });
    }

    return result;
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
