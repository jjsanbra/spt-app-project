import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  BookingType,
  ClubRole,
  NotificationType,
  ParticipantStatus,
  PaymentMethod,
  PaymentStatus,
  ActivityAction,
} from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { BookingResponseDto } from './dto/booking-response.dto';
import { CancelBookingDto, CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  /**
   * Crear una nueva reserva completa (FULL) con validación transaccional contra solapamientos
   */
  async create(clubId: string, userId: string, dto: CreateBookingDto): Promise<BookingResponseDto> {
    const start = new Date(dto.startTime);
    const end = new Date(dto.endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Las fechas de inicio y fin deben ser válidas');
    }

    if (start >= end) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    if (start < new Date()) {
      throw new BadRequestException('No se puede reservar en fechas pasadas');
    }

    // 1. Verificar que la instalación existe y pertenece al club
    const facility = await this.prisma.facility.findFirst({
      where: { id: dto.facilityId, clubId, isActive: true },
    });

    if (!facility) {
      throw new NotFoundException('Instalación deportiva no encontrada o no disponible');
    }

    // 2. Verificar que no intersecta con ningún bloqueo de pista
    const block = await this.prisma.facilityBlock.findFirst({
      where: {
        facilityId: facility.id,
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (block) {
      throw new ConflictException(
        `La pista está bloqueada en esa franja horaria: ${block.title || block.reason || 'Mantenimiento'}`,
      );
    }

    // 3. Ejecutar creación bajo transacción para prevenir condiciones de carrera (Race Condition)
    const booking = await this.prisma.$transaction(async (tx) => {
      // Comprobar si ya existe una reserva activa en esa franja
      const conflictingBooking = await tx.booking.findFirst({
        where: {
          facilityId: facility.id,
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING_CONFIRMATION] },
          startTime: { lt: end },
          endTime: { gt: start },
        },
      });

      if (conflictingBooking) {
        throw new ConflictException('La franja horaria seleccionada ya ha sido reservada por otro usuario');
      }

      // 4. Calcular precio según reglas de tarificación
      const dayOfWeek = start.getUTCDay();
      const startHour = `${start.getUTCHours().toString().padStart(2, '0')}:${start.getUTCMinutes().toString().padStart(2, '0')}`;

      const user = await tx.user?.findUnique({
        where: { id: userId },
        select: { id: true, isSuperAdmin: true },
      });

      const membership = await tx.clubMembership.findFirst({
        where: { clubId, userId, isActive: true },
      });
      const isMember = !!membership;
      const isPrivileged = !!(user?.isSuperAdmin || membership?.role === ClubRole.OWNER);

      let totalPrice = 0;

      if (!isPrivileged) {
        const pricingRules = await tx.pricingRule.findMany({
          where: { clubId },
          orderBy: { priority: 'desc' },
        });

        let basePrice = isMember ? 16.0 : 22.0;
        let lightSurcharge = 0;

        const applicableRules = pricingRules
          .filter((rule) => {
            if (rule.facilityId && rule.facilityId !== facility.id) return false;
            if (rule.sportType && rule.sportType !== facility.sportType) return false;
            if (rule.daysOfWeek && rule.daysOfWeek.length > 0 && !rule.daysOfWeek.includes(dayOfWeek)) return false;
            if (rule.startTime && rule.endTime) {
              if (startHour < rule.startTime || startHour >= rule.endTime) return false;
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
          const matchedRule = applicableRules[0];
          basePrice = isMember ? Number(matchedRule.memberPrice) : Number(matchedRule.guestPrice);
          if (dto.lightIncluded && facility.hasLighting) {
            lightSurcharge = Number(matchedRule.lightSurcharge || 0);
          }
        }

        totalPrice = basePrice + lightSurcharge;
      }

      // 5. Crear la reserva
      const bookingType = dto.bookingType ?? BookingType.FULL;
      const newBooking = await tx.booking.create({
        data: {
          clubId,
          facilityId: facility.id,
          userId,
          bookingType,
          status: BookingStatus.CONFIRMED,
          startTime: start,
          endTime: end,
          totalPrice,
          lightIncluded: dto.lightIncluded ?? false,
          notes: dto.notes ?? null,
        },
        include: {
          facility: {
            select: { id: true, name: true, sportType: true, maxPlayers: true },
          },
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });

      // 6. Generar registro de pago y participantes según tipo de reserva
      const paymentStatus = isPrivileged ? PaymentStatus.COMPLETED : PaymentStatus.PENDING;

      if (bookingType === BookingType.OPEN) {
        const maxPlayers = facility.maxPlayers || 4;
        const individualPrice = isPrivileged
          ? 0
          : Math.round((totalPrice / maxPlayers) * 100) / 100;

        // Registrar al creador como anfitrión (slot 1)
        const hostParticipant = await tx.bookingParticipant.create({
          data: {
            bookingId: newBooking.id,
            userId,
            isHost: true,
            slotNumber: 1,
            individualPrice,
            status: ParticipantStatus.REGISTERED,
          },
        });

        // Pago individual del anfitrión
        await tx.payment.create({
          data: {
            clubId,
            bookingId: newBooking.id,
            userId,
            participantId: hostParticipant.id,
            amount: individualPrice,
            method: PaymentMethod.PRESENTIAL_CASH,
            status: paymentStatus,
          },
        });
      } else {
        // Reserva completa: un solo pago por el total
        await tx.payment.create({
          data: {
            clubId,
            bookingId: newBooking.id,
            userId,
            amount: totalPrice,
            method: PaymentMethod.PRESENTIAL_CASH,
            status: paymentStatus,
          },
        });
      }

      return newBooking;
    });

    // Notificar al usuario (in-app y email simulado)
    const isHost = dto.bookingType === BookingType.OPEN;
    this.notificationsService
      .createNotification({
        userId,
        clubId,
        title: isHost ? 'Partida abierta creada' : '¡Reserva confirmada!',
        message: `Pista ${booking.facility.name} confirmada para el ${start.toLocaleDateString('es-ES')}.`,
        type: NotificationType.BOOKING_CONFIRMED,
        metadata: { bookingId: booking.id, facilityId: booking.facilityId },
        sendEmail: true,
        userEmail: booking.user?.email,
      })
      .catch(() => null);

    // Registro de auditoría
    this.activityLogsService.log({
      clubId,
      userId,
      action: ActivityAction.BOOKING_CREATED,
      entityType: 'Booking',
      entityId: booking.id,
      summary: `Reserva creada en ${booking.facility.name} (${start.toLocaleDateString('es-ES')})`,
      metadata: {
        bookingId: booking.id,
        facilityName: booking.facility.name,
        bookingType: booking.bookingType,
        totalPrice: Number(booking.totalPrice),
        startTime: booking.startTime,
        endTime: booking.endTime,
      },
    });

    return this.mapToResponse(booking);
  }

  /**
   * Listar partidas abiertas disponibles en el club
   */
  async findOpenMatches(
    clubId: string,
    currentUserId: string,
    dateStr?: string,
    sportType?: any,
  ): Promise<any[]> {
    const where: any = {
      clubId,
      bookingType: BookingType.OPEN,
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.PENDING_CONFIRMATION] },
      startTime: { gt: new Date() },
    };

    if (dateStr) {
      const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
      const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);
      where.startTime = { gte: dayStart, lte: dayEnd };
    }

    if (sportType) {
      where.facility = { sportType };
    }

    const matches = await this.prisma.booking.findMany({
      where,
      include: {
        facility: {
          select: { id: true, name: true, sportType: true, maxPlayers: true },
        },
        participants: {
          where: { status: { not: ParticipantStatus.CANCELLED } },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
          orderBy: { slotNumber: 'asc' },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return matches.map((m) => {
      const maxPlayers = m.facility.maxPlayers || 4;
      const occupiedSlots = m.participants.length;
      const availableSlots = Math.max(0, maxPlayers - occupiedSlots);
      const isCurrentUserJoined = m.participants.some((p) => p.userId === currentUserId);
      const isCurrentUserHost = m.participants.some(
        (p) => p.userId === currentUserId && p.isHost,
      );
      const pricePerPlayer =
        m.participants[0]?.individualPrice != null
          ? Number(m.participants[0].individualPrice)
          : Math.round((Number(m.totalPrice) / maxPlayers) * 100) / 100;

      return {
        id: m.id,
        clubId: m.clubId,
        facilityId: m.facilityId,
        facilityName: m.facility.name,
        sportType: m.facility.sportType,
        startTime: m.startTime,
        endTime: m.endTime,
        totalPrice: Number(m.totalPrice),
        pricePerPlayer,
        maxPlayers,
        availableSlots,
        occupiedSlots,
        isCurrentUserJoined,
        isCurrentUserHost,
        notes: m.notes,
        participants: m.participants.map((p) => ({
          id: p.id,
          userId: p.userId,
          name: p.user ? `${p.user.firstName} ${p.user.lastName}`.trim() : (p.guestName || 'Invitado'),
          avatarUrl: p.user?.avatarUrl,
          slotNumber: p.slotNumber,
          isHost: p.isHost,
          status: p.status,
          joinedAt: p.joinedAt,
        })),
      };
    });
  }

  /**
   * Unirse a una partida abierta
   */
  async joinOpenMatch(clubId: string, userId: string, bookingId: string): Promise<any> {
    const result = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: { id: bookingId, clubId, bookingType: BookingType.OPEN },
        include: {
          facility: true,
          participants: {
            where: { status: { not: ParticipantStatus.CANCELLED } },
            include: { user: true },
          },
        },
      });

      if (!booking) {
        throw new NotFoundException('Partida abierta no encontrada');
      }

      if (booking.status === BookingStatus.CANCELLED) {
        throw new BadRequestException('La partida abierta ha sido cancelada');
      }

      if (booking.startTime <= new Date()) {
        throw new BadRequestException('No puedes unirte a una partida que ya ha comenzado');
      }

      const isAlreadyJoined = booking.participants.some((p) => p.userId === userId);
      if (isAlreadyJoined) {
        throw new BadRequestException('Ya formas parte de esta partida abierta');
      }

      const maxPlayers = booking.facility.maxPlayers || 4;
      if (booking.participants.length >= maxPlayers) {
        throw new ConflictException('La partida abierta ya ha alcanzado el límite máximo de jugadores');
      }

      // Encontrar el menor slot libre
      const occupiedSlots = new Set(booking.participants.map((p) => p.slotNumber));
      let nextSlot = 1;
      while (occupiedSlots.has(nextSlot) && nextSlot <= maxPlayers) {
        nextSlot++;
      }

      const individualPrice = Math.round((Number(booking.totalPrice) / maxPlayers) * 100) / 100;

      const newParticipant = await tx.bookingParticipant.create({
        data: {
          bookingId: booking.id,
          userId,
          isHost: false,
          slotNumber: nextSlot,
          individualPrice,
          status: ParticipantStatus.REGISTERED,
        },
      });

      await tx.payment.create({
        data: {
          clubId,
          bookingId: booking.id,
          userId,
          participantId: newParticipant.id,
          amount: individualPrice,
          method: PaymentMethod.PRESENTIAL_CASH,
          status: PaymentStatus.PENDING,
        },
      });

      // Devolver partida abierta actualizada
      const updatedMatch = await tx.booking.findFirst({
        where: { id: bookingId },
        include: {
          facility: true,
          participants: {
            where: { status: { not: ParticipantStatus.CANCELLED } },
            include: { user: true },
            orderBy: { slotNumber: 'asc' },
          },
        },
      });

      const updatedOccupied = updatedMatch!.participants.length;

      return {
        id: updatedMatch!.id,
        clubId: updatedMatch!.clubId,
        facilityId: updatedMatch!.facilityId,
        facilityName: updatedMatch!.facility.name,
        sportType: updatedMatch!.facility.sportType,
        startTime: updatedMatch!.startTime,
        endTime: updatedMatch!.endTime,
        totalPrice: Number(updatedMatch!.totalPrice),
        pricePerPlayer: individualPrice,
        maxPlayers,
        availableSlots: Math.max(0, maxPlayers - updatedOccupied),
        occupiedSlots: updatedOccupied,
        isCurrentUserJoined: true,
        isCurrentUserHost: false,
        notes: updatedMatch!.notes,
        participants: updatedMatch!.participants.map((p) => ({
          id: p.id,
          userId: p.userId,
          name: p.user ? `${p.user.firstName} ${p.user.lastName}`.trim() : (p.guestName || 'Invitado'),
          avatarUrl: p.user?.avatarUrl,
          slotNumber: p.slotNumber,
          isHost: p.isHost,
          status: p.status,
          joinedAt: p.joinedAt,
        })),
      };
    });

    // Notificar al anfitrión
    const host = result.participants.find((p: any) => p.isHost);
    if (host && host.userId && host.userId !== userId) {
      this.notificationsService
        .createNotification({
          userId: host.userId,
          clubId,
          title: 'Nuevo jugador en tu partida',
          message: `Un nuevo jugador se ha unido a tu partido en ${result.facilityName}.`,
          type: NotificationType.OPEN_GAME_JOINED,
          metadata: { bookingId },
        })
        .catch(() => null);
    }

    // Notificar si la partida se ha completado
    if (result.availableSlots === 0) {
      for (const p of result.participants) {
        if (p.userId) {
          this.notificationsService
            .createNotification({
              userId: p.userId,
              clubId,
              title: '¡Partida completa!',
              message: `El partido en ${result.facilityName} ya tiene todas las plazas cubiertas.`,
              type: NotificationType.OPEN_GAME_COMPLETE,
              metadata: { bookingId },
            })
            .catch(() => null);
        }
      }
    }

    return result;
  }

  /**
   * Abandonar una partida abierta
   */
  async leaveOpenMatch(
    clubId: string,
    userId: string,
    bookingId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findFirst({
        where: { id: bookingId, clubId, bookingType: BookingType.OPEN },
        include: {
          participants: {
            where: { status: { not: ParticipantStatus.CANCELLED } },
            orderBy: { joinedAt: 'asc' },
          },
        },
      });

      if (!booking) {
        throw new NotFoundException('Partida abierta no encontrada');
      }

      if (booking.startTime <= new Date()) {
        throw new BadRequestException('No puedes abandonar una partida que ya ha comenzado');
      }

      const participant = booking.participants.find((p) => p.userId === userId);
      if (!participant) {
        throw new BadRequestException('No estás inscrito en esta partida abierta');
      }

      // Marcar participante como cancelado
      await tx.bookingParticipant.update({
        where: { id: participant.id },
        data: { status: ParticipantStatus.CANCELLED },
      });

      // Eliminar su pago pendiente no efectuado
      await tx.payment.deleteMany({
        where: { participantId: participant.id, status: PaymentStatus.PENDING },
      });

      const remainingParticipants = booking.participants.filter((p) => p.id !== participant.id);

      if (remainingParticipants.length === 0) {
        // Si no queda nadie, cancelar la reserva
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: BookingStatus.CANCELLED,
            cancellationReason: 'Todos los participantes han abandonado la partida',
            cancelledAt: new Date(),
          },
        });
      } else if (participant.isHost) {
        // Traspasar el rol de anfitrión al siguiente participante
        await tx.bookingParticipant.update({
          where: { id: remainingParticipants[0].id },
          data: { isHost: true },
        });
      }

      return {
        success: true,
        message: 'Has abandonado la partida abierta correctamente',
      };
    });
  }

  /**
   * Listar reservas del usuario autenticado
   */
  async findMyBookings(clubId: string, userId: string): Promise<BookingResponseDto[]> {
    const bookings = await this.prisma.booking.findMany({
      where: { clubId, userId },
      include: {
        facility: {
          select: { id: true, name: true, sportType: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    return bookings.map((b) => this.mapToResponse(b));
  }

  /**
   * Cancelar una reserva existente
   */
  async cancel(
    clubId: string,
    userId: string,
    bookingId: string,
    dto?: CancelBookingDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, clubId, userId },
      include: {
        facility: {
          select: { id: true, name: true, sportType: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Reserva no encontrada o no pertenece al usuario');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('La reserva ya se encuentra cancelada');
    }

    const updated = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELLED,
        cancellationReason: dto?.cancellationReason ?? 'Cancelada por el usuario',
        cancelledAt: new Date(),
      },
      include: {
        facility: {
          select: { id: true, name: true, sportType: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Notificar cancelación al usuario
    this.notificationsService
      .createNotification({
        userId,
        clubId,
        title: 'Reserva cancelada',
        message: `Tu reserva en ${booking.facility.name} ha sido cancelada.`,
        type: NotificationType.BOOKING_CANCELLED,
        metadata: { bookingId: booking.id },
      })
      .catch(() => null);

    // Registro de auditoría
    this.activityLogsService.log({
      clubId,
      userId,
      action: ActivityAction.BOOKING_CANCELLED,
      entityType: 'Booking',
      entityId: updated.id,
      summary: `Reserva cancelada en ${booking.facility.name}. Motivo: ${updated.cancellationReason}`,
      metadata: {
        bookingId: updated.id,
        facilityName: booking.facility.name,
        cancellationReason: updated.cancellationReason,
        startTime: updated.startTime,
      },
    });

    return this.mapToResponse(updated);
  }

  private mapToResponse(b: any): BookingResponseDto {
    return {
      id: b.id,
      clubId: b.clubId,
      facilityId: b.facilityId,
      userId: b.userId,
      bookingType: b.bookingType,
      status: b.status,
      startTime: b.startTime,
      endTime: b.endTime,
      totalPrice: Number(b.totalPrice),
      lightIncluded: b.lightIncluded,
      notes: b.notes,
      cancellationReason: b.cancellationReason,
      cancelledAt: b.cancelledAt,
      createdAt: b.createdAt,
      facility: {
        id: b.facility.id,
        name: b.facility.name,
        sportType: b.facility.sportType,
      },
      user: b.user
        ? {
            id: b.user.id,
            name: `${b.user.firstName} ${b.user.lastName}`.trim(),
            email: b.user.email,
          }
        : undefined,
    };
  }
}
