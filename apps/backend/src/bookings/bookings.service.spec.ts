import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BookingStatus, BookingType, ParticipantStatus, SportType } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
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
    maxPlayers: 4,
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
    totalPrice: 24.0,
    lightIncluded: false,
    notes: null,
    cancellationReason: null,
    cancelledAt: null,
    createdAt: new Date(),
    facility: {
      id: 'fac-1',
      name: 'Pista Pádel 1',
      sportType: SportType.PADEL,
      maxPlayers: 4,
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
    booking: { findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn(), create: jest.fn() },
    bookingParticipant: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    payment: { create: jest.fn(), deleteMany: jest.fn() },
    $transaction: jest.fn(),
  };

  const mockNotificationsService = {
    createNotification: jest.fn().mockResolvedValue({ id: 'notif-1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear una reserva completa (FULL) con éxito bajo transacción', async () => {
      mockPrisma.facility.findFirst.mockResolvedValue(mockFacility);
      mockPrisma.facilityBlock.findFirst.mockResolvedValue(null);

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        const txMock = {
          booking: {
            findFirst: jest.fn().mockResolvedValue(null),
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

    it('debe dar precedencia a la tarifa específica de pista sobre la regla global', async () => {
      mockPrisma.facility.findFirst.mockResolvedValue(mockFacility);
      mockPrisma.facilityBlock.findFirst.mockResolvedValue(null);

      const globalRule = {
        id: 'rule-global',
        clubId: 'club-1',
        facilityId: null,
        sportType: null,
        daysOfWeek: [],
        memberPrice: 10.0,
        guestPrice: 15.0,
        priority: 5, // Prioridad más alta, pero ámbito global
      };

      const facilityRule = {
        id: 'rule-facility',
        clubId: 'club-1',
        facilityId: 'fac-1',
        sportType: SportType.PADEL,
        daysOfWeek: [],
        memberPrice: 30.0,
        guestPrice: 40.0,
        priority: 1, // Prioridad menor, pero ámbito pista
      };

      let createdBookingData: any = null;
      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        const txMock = {
          booking: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockImplementation(({ data }) => {
              createdBookingData = data;
              return Promise.resolve({ ...mockBooking, totalPrice: data.totalPrice });
            }),
          },
          // Devolvemos la global primero en el array
          pricingRule: { findMany: jest.fn().mockResolvedValue([globalRule, facilityRule]) },
          clubMembership: { findFirst: jest.fn().mockResolvedValue({ id: 'mem-1', isActive: true }) }, // Socio
          payment: { create: jest.fn().mockResolvedValue({ id: 'pay-1' }) },
        };
        return callback(txMock);
      });

      await service.create('club-1', 'user-1', {
        facilityId: 'fac-1',
        startTime: '2026-10-25T10:00:00.000Z',
        endTime: '2026-10-25T11:30:00.000Z',
        lightIncluded: false,
      });

      // Debe haber tomado 30.0 de la regla de pista (no los 10.0 de la global)
      expect(createdBookingData.totalPrice).toBe(30.0);
    });

    it('debe crear una partida abierta (OPEN) registrando al anfitrión en slot 1 y su pago individual', async () => {
      mockPrisma.facility.findFirst.mockResolvedValue(mockFacility);
      mockPrisma.facilityBlock.findFirst.mockResolvedValue(null);

      const openBooking = {
        ...mockBooking,
        bookingType: BookingType.OPEN,
      };

      const mockTx = {
        booking: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue(openBooking),
        },
        pricingRule: { findMany: jest.fn().mockResolvedValue([]) },
        clubMembership: { findFirst: jest.fn().mockResolvedValue(null) },
        bookingParticipant: {
          create: jest.fn().mockResolvedValue({ id: 'part-1', slotNumber: 1, isHost: true }),
        },
        payment: { create: jest.fn().mockResolvedValue({ id: 'pay-part-1' }) },
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      const result = await service.create('club-1', 'user-1', {
        facilityId: 'fac-1',
        startTime: '2026-10-25T10:00:00.000Z',
        endTime: '2026-10-25T11:30:00.000Z',
        bookingType: BookingType.OPEN,
      });

      expect(result.bookingType).toBe(BookingType.OPEN);
      expect(mockTx.bookingParticipant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isHost: true,
            slotNumber: 1,
          }),
        }),
      );
      expect(mockTx.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            participantId: 'part-1',
          }),
        }),
      );
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
  });

  describe('findOpenMatches', () => {
    it('debe listar partidas abiertas calculando plazas disponibles', async () => {
      const mockOpenMatches = [
        {
          id: 'open-1',
          clubId: 'club-1',
          facilityId: 'fac-1',
          totalPrice: 24.0,
          startTime: new Date('2026-10-25T18:00:00.000Z'),
          endTime: new Date('2026-10-25T19:30:00.000Z'),
          facility: { id: 'fac-1', name: 'Pista 1', sportType: SportType.PADEL, maxPlayers: 4 },
          participants: [
            {
              id: 'part-1',
              userId: 'user-host',
              slotNumber: 1,
              isHost: true,
              individualPrice: 6.0,
              status: ParticipantStatus.REGISTERED,
              joinedAt: new Date(),
              user: { id: 'user-host', firstName: 'Juan', lastName: 'Pérez', avatarUrl: null },
            },
          ],
        },
      ];

      mockPrisma.booking.findMany.mockResolvedValue(mockOpenMatches);

      const result = await service.findOpenMatches('club-1', 'user-guest');

      expect(result.length).toBe(1);
      expect(result[0].occupiedSlots).toBe(1);
      expect(result[0].availableSlots).toBe(3);
      expect(result[0].pricePerPlayer).toBe(6.0);
      expect(result[0].isCurrentUserJoined).toBe(false);
    });
  });

  describe('joinOpenMatch', () => {
    it('debe unirse exitosamente a una partida abierta con plazas disponibles', async () => {
      const mockBookingWithSlots = {
        id: 'open-1',
        clubId: 'club-1',
        totalPrice: 24.0,
        startTime: new Date(Date.now() + 86400000), // Mañana
        facility: { id: 'fac-1', name: 'Pista 1', sportType: SportType.PADEL, maxPlayers: 4 },
        participants: [
          { id: 'part-1', userId: 'user-host', slotNumber: 1, isHost: true },
        ],
      };

      const mockTx = {
        booking: {
          findFirst: jest
            .fn()
            .mockResolvedValueOnce(mockBookingWithSlots)
            .mockResolvedValueOnce({
              ...mockBookingWithSlots,
              participants: [
                { id: 'part-1', userId: 'user-host', slotNumber: 1, isHost: true, user: { firstName: 'Juan', lastName: 'P' } },
                { id: 'part-2', userId: 'user-2', slotNumber: 2, isHost: false, user: { firstName: 'Ana', lastName: 'G' } },
              ],
            }),
        },
        bookingParticipant: {
          create: jest.fn().mockResolvedValue({ id: 'part-2', slotNumber: 2, isHost: false }),
        },
        payment: { create: jest.fn().mockResolvedValue({ id: 'pay-2' }) },
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      const result = await service.joinOpenMatch('club-1', 'user-2', 'open-1');

      expect(result.id).toBe('open-1');
      expect(result.occupiedSlots).toBe(2);
      expect(result.availableSlots).toBe(2);
      expect(result.isCurrentUserJoined).toBe(true);
      expect(mockTx.bookingParticipant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-2',
            slotNumber: 2,
            individualPrice: 6.0,
          }),
        }),
      );
    });

    it('debe rechazar con ConflictException si la partida ya está completa', async () => {
      const mockFullBooking = {
        id: 'open-1',
        clubId: 'club-1',
        startTime: new Date(Date.now() + 86400000),
        facility: { maxPlayers: 2 },
        participants: [
          { id: 'p1', userId: 'u1', slotNumber: 1 },
          { id: 'p2', userId: 'u2', slotNumber: 2 },
        ],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          booking: { findFirst: jest.fn().mockResolvedValue(mockFullBooking) },
        });
      });

      await expect(
        service.joinOpenMatch('club-1', 'user-3', 'open-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('debe rechazar con BadRequestException si el usuario ya está inscrito', async () => {
      const mockBookingAlreadyJoined = {
        id: 'open-1',
        clubId: 'club-1',
        startTime: new Date(Date.now() + 86400000),
        facility: { maxPlayers: 4 },
        participants: [{ id: 'p1', userId: 'user-1', slotNumber: 1 }],
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return callback({
          booking: { findFirst: jest.fn().mockResolvedValue(mockBookingAlreadyJoined) },
        });
      });

      await expect(
        service.joinOpenMatch('club-1', 'user-1', 'open-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('leaveOpenMatch', () => {
    it('debe permitir abandonar la partida y transferir capitanía si sale el anfitrión', async () => {
      const mockMatch = {
        id: 'open-1',
        clubId: 'club-1',
        startTime: new Date(Date.now() + 86400000),
        participants: [
          { id: 'part-host', userId: 'user-host', isHost: true },
          { id: 'part-2', userId: 'user-2', isHost: false },
        ],
      };

      const mockTx = {
        booking: { findFirst: jest.fn().mockResolvedValue(mockMatch), update: jest.fn() },
        bookingParticipant: { update: jest.fn() },
        payment: { deleteMany: jest.fn() },
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockTx));

      const result = await service.leaveOpenMatch('club-1', 'user-host', 'open-1');

      expect(result.success).toBe(true);
      expect(mockTx.bookingParticipant.update).toHaveBeenCalledWith({
        where: { id: 'part-host' },
        data: { status: ParticipantStatus.CANCELLED },
      });
      // Comprobar que transfiere isHost al siguiente
      expect(mockTx.bookingParticipant.update).toHaveBeenCalledWith({
        where: { id: 'part-2' },
        data: { isHost: true },
      });
    });
  });

  describe('cancel', () => {
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

    it('debe lanzar BadRequestException si la reserva ya se encontraba cancelada', async () => {
      mockPrisma.booking.findFirst.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
      });

      await expect(
        service.cancel('club-1', 'user-1', 'book-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findMyBookings', () => {
    it('debe listar las reservas del usuario mapeadas correctamente', async () => {
      mockPrisma.booking.findMany.mockResolvedValue([mockBooking]);

      const result = await service.findMyBookings('club-1', 'user-1');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(mockBooking.id);
    });
  });

  describe('findOpenMatches con filtros', () => {
    it('debe listar partidas abiertas aplicando filtro de fecha y deporte', async () => {
      const matchWithParticipants = {
        ...mockBooking,
        bookingType: BookingType.OPEN,
        participants: [
          {
            id: 'part-1',
            userId: 'user-1',
            isHost: true,
            status: ParticipantStatus.CONFIRMED,
            slotNumber: 1,
            individualPrice: 6.0,
            user: { firstName: 'Carlos', lastName: 'Martínez', avatarUrl: null },
          },
        ],
      };
      mockPrisma.booking.findMany.mockResolvedValue([matchWithParticipants]);

      const result = await service.findOpenMatches('club-1', 'user-1', '2026-10-25', SportType.PADEL);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].availableSlots).toBe(3);
      expect(result[0].isCurrentUserJoined).toBe(true);
    });
  });
});
