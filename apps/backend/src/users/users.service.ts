import { Injectable, NotFoundException } from '@nestjs/common';
import { UserSummaryDto } from '../auth/dto/auth-response.dto';
import { PrismaService } from '../core/database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserDashboardResponseDto } from './dto/user-dashboard-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtener métricas y próxima reserva del usuario autenticado para el portal
   */
  async getDashboard(userId: string): Promise<UserDashboardResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const now = new Date();

    // 1. Próxima reserva inminente
    const nextBookingRaw = await this.prisma.booking.findFirst({
      where: {
        OR: [
          { userId },
          { participants: { some: { userId } } },
        ],
        startTime: { gte: now },
        status: { not: 'CANCELLED' },
      },
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

    const nextBooking = nextBookingRaw
      ? {
          id: nextBookingRaw.id,
          facilityName: nextBookingRaw.facility.name,
          sportType: nextBookingRaw.facility.sportType,
          startTime: nextBookingRaw.startTime.toISOString(),
          endTime: nextBookingRaw.endTime.toISOString(),
        }
      : null;

    // 2. Estadísticas del mes en curso
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const bookingsThisMonth = await this.prisma.booking.findMany({
      where: {
        OR: [
          { userId },
          { participants: { some: { userId } } },
        ],
        startTime: { gte: monthStart },
        status: { not: 'CANCELLED' },
      },
      select: {
        totalPrice: true,
        startTime: true,
        endTime: true,
      },
    });

    const matchesPlayed = bookingsThisMonth.length;
    const totalMinutes = bookingsThisMonth.reduce((acc, b) => {
      const diffMs = b.endTime.getTime() - b.startTime.getTime();
      return acc + diffMs / (1000 * 60);
    }, 0);
    const hoursPlayed = Math.round((totalMinutes / 60) * 10) / 10;

    const totalSpent = bookingsThisMonth.reduce(
      (sum, b) => sum + Number(b.totalPrice || 0),
      0,
    );

    // 3. Historial de actividad de los últimos 4 meses
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const activityHistory: { month: string; matchesCount: number }[] = [];

    for (let i = 3; i >= 0; i--) {
      const mDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(mDate.getFullYear(), mDate.getMonth(), 1, 0, 0, 0, 0);
      const mEnd = new Date(mDate.getFullYear(), mDate.getMonth() + 1, 0, 23, 59, 59, 999);

      const count = await this.prisma.booking.count({
        where: {
          OR: [
            { userId },
            { participants: { some: { userId } } },
          ],
          startTime: { gte: mStart, lte: mEnd },
          status: { not: 'CANCELLED' },
        },
      });

      activityHistory.push({
        month: monthNames[mDate.getMonth()],
        matchesCount: count,
      });
    }

    return {
      nextBooking,
      monthlyStats: {
        matchesPlayed,
        hoursPlayed,
        totalSpent: Math.round(totalSpent * 100) / 100,
        estimatedLevel: '3.5 Intermedio',
      },
      activityHistory,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserSummaryDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
      include: {
        memberships: {
          where: { isActive: true },
          include: {
            club: {
              select: {
                id: true,
                name: true,
                slug: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    return {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      phone: updated.phone,
      avatarUrl: updated.avatarUrl,
      isSuperAdmin: updated.isSuperAdmin,
      memberships: (updated.memberships || [])
        .filter((m) => m.club && m.club.isActive)
        .map((m) => ({
          clubId: m.club.id,
          clubName: m.club.name,
          clubSlug: m.club.slug,
          role: m.role,
          memberNumber: m.memberNumber,
          walletBalance: Number(m.walletBalance),
        })),
    };
  }
}
