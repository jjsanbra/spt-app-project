import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, BookingType, PaymentMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { BookingResponseDto } from './dto/booking-response.dto';
import { CancelBookingDto, CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

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

      const pricingRules = await tx.pricingRule.findMany({
        where: { clubId },
        orderBy: { priority: 'desc' },
      });

      const membership = await tx.clubMembership.findFirst({
        where: { clubId, userId, isActive: true },
      });
      const isMember = !!membership;

      let basePrice = isMember ? 16.0 : 22.0;
      let lightSurcharge = 0;

      for (const rule of pricingRules) {
        if (rule.facilityId && rule.facilityId !== facility.id) continue;
        if (rule.sportType && rule.sportType !== facility.sportType) continue;
        if (rule.daysOfWeek && rule.daysOfWeek.length > 0 && !rule.daysOfWeek.includes(dayOfWeek)) continue;
        if (rule.startTime && rule.endTime) {
          if (startHour < rule.startTime || startHour >= rule.endTime) continue;
        }

        basePrice = isMember ? Number(rule.memberPrice) : Number(rule.guestPrice);
        if (dto.lightIncluded && facility.hasLighting) {
          lightSurcharge = Number(rule.lightSurcharge || 0);
        }
        break;
      }

      const totalPrice = basePrice + lightSurcharge;

      // 5. Crear la reserva
      const newBooking = await tx.booking.create({
        data: {
          clubId,
          facilityId: facility.id,
          userId,
          bookingType: BookingType.FULL,
          status: BookingStatus.CONFIRMED,
          startTime: start,
          endTime: end,
          totalPrice,
          lightIncluded: dto.lightIncluded ?? false,
          notes: dto.notes ?? null,
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

      // 6. Generar registro de pago pendiente (Modalidad A: presencial en centro)
      await tx.payment.create({
        data: {
          clubId,
          bookingId: newBooking.id,
          userId,
          amount: totalPrice,
          method: PaymentMethod.PRESENTIAL_CASH,
          status: PaymentStatus.PENDING,
        },
      });

      return newBooking;
    });

    return this.mapToResponse(booking);
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
