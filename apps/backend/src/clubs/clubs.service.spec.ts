import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMode } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { ClubsService } from './clubs.service';

describe('ClubsService', () => {
  let service: ClubsService;
  let prisma: any;

  const mockClub = {
    id: 'club-uuid-1',
    name: 'Padel Club Madrid',
    slug: 'padel-club-madrid',
    description: 'Club moderno',
    email: 'info@padelclub.com',
    phone: '+34911111111',
    address: 'Calle Padel 1',
    city: 'Madrid',
    postalCode: '28001',
    openingHour: 8,
    closingHour: 23,
    slotDurationMinutes: 60,
    openGameMinNoticeHours: 2,
    paymentMode: PaymentMode.PRESENTIAL,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    club: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    facility: {
      count: jest.fn(),
    },
    facilityBlock: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    clubMembership: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClubsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ClubsService>(ClubsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('debe obtener la configuración del club existente', async () => {
    mockPrisma.club.findUnique.mockResolvedValue(mockClub);

    const result = await service.getSettings('club-uuid-1');

    expect(result.id).toBe('club-uuid-1');
    expect(result.name).toBe('Padel Club Madrid');
    expect(result.openingHour).toBe(8);
    expect(result.closingHour).toBe(23);
  });

  it('debe lanzar NotFoundException si el club no existe', async () => {
    mockPrisma.club.findUnique.mockResolvedValue(null);

    await expect(service.getSettings('non-existent')).rejects.toThrow(NotFoundException);
  });

  it('debe actualizar la configuración correctamente', async () => {
    mockPrisma.club.findUnique.mockResolvedValue(mockClub);
    mockPrisma.club.update.mockResolvedValue({
      ...mockClub,
      openingHour: 9,
      closingHour: 22,
      paymentMode: PaymentMode.ONLINE,
    });

    const result = await service.updateSettings('club-uuid-1', {
      openingHour: 9,
      closingHour: 22,
      paymentMode: PaymentMode.ONLINE,
    });

    expect(result.openingHour).toBe(9);
    expect(result.closingHour).toBe(22);
    expect(result.paymentMode).toBe(PaymentMode.ONLINE);
  });

  it('debe lanzar BadRequestException si openingHour >= closingHour', async () => {
    mockPrisma.club.findUnique.mockResolvedValue(mockClub);

    await expect(
      service.updateSettings('club-uuid-1', {
        openingHour: 23,
        closingHour: 8,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('debe calcular métricas del dashboard completo (getDashboard)', async () => {
    mockPrisma.club.findUnique.mockResolvedValue({
      ...mockClub,
      facilities: [{ id: 'fac-1', name: 'Pista 1', sportType: 'PADEL' }],
    });

    const now = new Date();
    mockPrisma.booking.findMany
      .mockResolvedValueOnce([
        {
          id: 'b-1',
          facilityId: 'fac-1',
          startTime: now,
          endTime: new Date(now.getTime() + 90 * 60000),
          payments: [{ status: 'COMPLETED' }],
        },
      ]) // today bookings
      .mockResolvedValueOnce([
        { totalPrice: 100, facility: { sportType: 'PADEL' } },
        { totalPrice: 50, facility: { sportType: 'TENNIS' } },
      ]) // current month bookings
      .mockResolvedValueOnce([{ totalPrice: 120 }]) // prev month bookings
      .mockResolvedValueOnce([
        { totalPrice: 100, facility: { sportType: 'PADEL' } },
        { totalPrice: 50, facility: { sportType: 'TENNIS' } },
      ]); // revenue by sport

    mockPrisma.facilityBlock.count.mockResolvedValue(1);
    mockPrisma.facilityBlock.findMany.mockResolvedValue([]);
    mockPrisma.clubMembership.count.mockResolvedValue(4);
    mockPrisma.booking.count.mockResolvedValue(2);

    const result = await service.getDashboard('club-uuid-1');

    expect(result).toBeDefined();
    expect(result.today.totalBookings).toBe(1);
    expect(result.today.activeBlocksCount).toBe(1);
    expect(result.month.totalRevenue).toBe(150);
    expect(result.month.newMembersCount).toBe(4);
    expect(result.revenueBySport.length).toBeGreaterThan(0);
    expect(result.occupancyTrend.length).toBe(14);
  });

  it('debe calcular métricas operativas de hoy (getOperationalDashboard)', async () => {
    mockPrisma.club.findUnique.mockResolvedValue({
      ...mockClub,
      facilities: [{ id: 'fac-1', name: 'Pista 1' }],
    });

    mockPrisma.booking.findMany.mockResolvedValueOnce([]);
    mockPrisma.facilityBlock.count.mockResolvedValue(0);
    mockPrisma.facilityBlock.findMany.mockResolvedValue([]);

    const result = await service.getOperationalDashboard('club-uuid-1');

    expect(result).toBeDefined();
    expect(result.today.totalBookings).toBe(0);
    expect(result.today.availableCourtsNext3Hours).toBe(1);
  });
});
