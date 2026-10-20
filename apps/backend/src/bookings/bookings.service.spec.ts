import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BookingStatus, BookingType, SportType } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { BookingsService } from './bookings.service';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: any;

  const mockFacility = {
    id: 'fac-1',
    clubId: 'club-1',
    name: 'Pista Pádel 1',
    sportType: SportType.PADEL,
    hasLighting: true,
    isActive: true,
  };

  const mockBooking = {
    id: 'book-1',
    clubId: 'club-1',
    facilityId: 'fac-1',
    userId: 'user-1',
    bookingType: BookingType.FULL,
    status: BookingStatus.CONFIRMED,
    startTime: new Date('2026-10-25T10:00:00.000Z'),
    endTime: new Date('2026-10-25T11:30:00.000Z'),
    totalPrice: 18.0,
    lightIncluded: false,
    notes: null,
    cancellationReason: null,
    cancelledAt: null,
    createdAt: new Date(),
    facility: {
      id: 'fac-1',
      name: 'Pista Pádel 1',
      sportType: SportType.PADEL,
    },
    user: {
      id: 'user-1',
      firstName: 'Carlos',
      lastName: 'Martínez',
      email: 'carlos@club.com',
    },
  };

  const mockPrisma = {
    facility: { findFirst: jest.fn() },
    facilityBlock: { findFirst: jest.fn() },
    booking: { findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('debe crear una reserva con éxito bajo transacción', async () => {
    mockPrisma.facility.findFirst.mockResolvedValue(mockFacility);
    mockPrisma.facilityBlock.findFirst.mockResolvedValue(null);

    // Simular ejecución del callback de $transaction
    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      const txMock = {
        booking: {
          findFirst: jest.fn().mockResolvedValue(null), // Sin conflicto
          create: jest.fn().mockResolvedValue(mockBooking),
        },
        pricingRule: { findMany: jest.fn().mockResolvedValue([]) },
        clubMembership: { findFirst: jest.fn().mockResolvedValue(null) },
        payment: { create: jest.fn().mockResolvedValue({ id: 'pay-1' }) },
      };
      return callback(txMock);
    });

    const result = await service.create('club-1', 'user-1', {
      facilityId: 'fac-1',
      startTime: '2026-10-25T10:00:00.000Z',
      endTime: '2026-10-25T11:30:00.000Z',
      lightIncluded: false,
    });

    expect(result.id).toBe('book-1');
    expect(result.facility.name).toBe('Pista Pádel 1');
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it('debe rechazar con ConflictException si la pista está bloqueada por mantenimiento', async () => {
    mockPrisma.facility.findFirst.mockResolvedValue(mockFacility);
    mockPrisma.facilityBlock.findFirst.mockResolvedValue({
      id: 'block-1',
      title: 'Torneo',
    });

    await expect(
      service.create('club-1', 'user-1', {
        facilityId: 'fac-1',
        startTime: '2026-10-25T10:00:00.000Z',
        endTime: '2026-10-25T11:30:00.000Z',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('debe rechazar con ConflictException si se detecta solapamiento en la transacción', async () => {
    mockPrisma.facility.findFirst.mockResolvedValue(mockFacility);
    mockPrisma.facilityBlock.findFirst.mockResolvedValue(null);

    mockPrisma.$transaction.mockImplementation(async (callback: any) => {
      const txMock = {
        booking: {
          findFirst: jest.fn().mockResolvedValue({ id: 'conflicting-book' }),
        },
      };
      return callback(txMock);
    });

    await expect(
      service.create('club-1', 'user-1', {
        facilityId: 'fac-1',
        startTime: '2026-10-25T10:00:00.000Z',
        endTime: '2026-10-25T11:30:00.000Z',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('debe permitir cancelar una reserva activa', async () => {
    mockPrisma.booking.findFirst.mockResolvedValue(mockBooking);
    mockPrisma.booking.update.mockResolvedValue({
      ...mockBooking,
      status: BookingStatus.CANCELLED,
      cancellationReason: 'Motivo personal',
    });

    const result = await service.cancel('club-1', 'user-1', 'book-1', {
      cancellationReason: 'Motivo personal',
    });

    expect(result.status).toBe(BookingStatus.CANCELLED);
    expect(result.cancellationReason).toBe('Motivo personal');
  });

  it('debe lanzar NotFoundException si se intenta cancelar una reserva inexistente', async () => {
    mockPrisma.booking.findFirst.mockResolvedValue(null);

    await expect(
      service.cancel('club-1', 'user-1', 'non-existent'),
    ).rejects.toThrow(NotFoundException);
  });
});
