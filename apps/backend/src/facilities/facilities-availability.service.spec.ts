import { Test, TestingModule } from '@nestjs/testing';
import { CourtType, SportType, SurfaceType } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { SlotStatus } from './dto/facility-availability-response.dto';
import { FacilitiesAvailabilityService } from './facilities-availability.service';

describe('FacilitiesAvailabilityService', () => {
  let service: FacilitiesAvailabilityService;
  let prisma: any;

  const mockClub = {
    id: 'club-1',
    openingHour: 9,
    closingHour: 12, // 9:00 a 12:00 -> 3 horas
  };

  const mockFacility = {
    id: 'fac-1',
    clubId: 'club-1',
    name: 'Pista 1 Central',
    sportType: SportType.PADEL,
    courtType: CourtType.INDOOR,
    surfaceType: SurfaceType.CRYSTAL,
    hasLighting: true,
    defaultSlotMinutes: 90, // slots de 90 min: 9:00-10:30, 10:30-12:00
    isActive: true,
  };

  const mockPricingRule = {
    id: 'rule-1',
    clubId: 'club-1',
    facilityId: 'fac-1',
    memberPrice: 15,
    guestPrice: 20,
    lightSurcharge: 2,
    isPeakHour: false,
    priority: 1,
    daysOfWeek: [],
    startTime: null,
    endTime: null,
  };

  const mockPrisma = {
    club: { findUnique: jest.fn() },
    facility: { findMany: jest.fn() },
    facilityBlock: { findMany: jest.fn() },
    booking: { findMany: jest.fn() },
    pricingRule: { findMany: jest.fn() },
    clubMembership: { findFirst: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacilitiesAvailabilityService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FacilitiesAvailabilityService>(FacilitiesAvailabilityService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('debe generar las franjas horarias en memoria y calcular precios', async () => {
    mockPrisma.club.findUnique.mockResolvedValue(mockClub);
    mockPrisma.facility.findMany.mockResolvedValue([mockFacility]);
    mockPrisma.facilityBlock.findMany.mockResolvedValue([]);
    mockPrisma.booking.findMany.mockResolvedValue([]);
    mockPrisma.pricingRule.findMany.mockResolvedValue([mockPricingRule]);
    mockPrisma.clubMembership.findFirst.mockResolvedValue({ id: 'mem-1' }); // socio

    const result = await service.getAvailability('club-1', '2026-10-25', SportType.PADEL, 'user-1');

    expect(result).toHaveLength(1);
    expect(result[0].slots).toHaveLength(2);

    // Slot 1: 09:00 - 10:30
    expect(result[0].slots[0].startHourText).toBe('09:00');
    expect(result[0].slots[0].endHourText).toBe('10:30');
    expect(result[0].slots[0].status).toBe(SlotStatus.AVAILABLE);
    expect(result[0].slots[0].price).toBe(15); // precio socio

    // Slot 2: 10:30 - 12:00
    expect(result[0].slots[1].startHourText).toBe('10:30');
    expect(result[0].slots[1].endHourText).toBe('12:00');
    expect(result[0].slots[1].status).toBe(SlotStatus.AVAILABLE);
  });

  it('debe marcar como BLOCKED las franjas que coincidan con un bloqueo de pista', async () => {
    mockPrisma.club.findUnique.mockResolvedValue(mockClub);
    mockPrisma.facility.findMany.mockResolvedValue([mockFacility]);
    mockPrisma.facilityBlock.findMany.mockResolvedValue([
      {
        facilityId: 'fac-1',
        title: 'Mantenimiento de Césped',
        startTime: new Date('2026-10-25T09:00:00.000Z'),
        endTime: new Date('2026-10-25T10:30:00.000Z'),
      },
    ]);
    mockPrisma.booking.findMany.mockResolvedValue([]);
    mockPrisma.pricingRule.findMany.mockResolvedValue([]);
    mockPrisma.clubMembership.findFirst.mockResolvedValue(null);

    const result = await service.getAvailability('club-1', '2026-10-25');

    expect(result[0].slots[0].status).toBe(SlotStatus.BLOCKED);
    expect(result[0].slots[0].blockedReason).toBe('Mantenimiento de Césped');
    expect(result[0].slots[1].status).toBe(SlotStatus.AVAILABLE);
  });

  it('debe marcar como OCCUPIED las franjas con reservas confirmadas', async () => {
    mockPrisma.club.findUnique.mockResolvedValue(mockClub);
    mockPrisma.facility.findMany.mockResolvedValue([mockFacility]);
    mockPrisma.facilityBlock.findMany.mockResolvedValue([]);
    mockPrisma.booking.findMany.mockResolvedValue([
      {
        facilityId: 'fac-1',
        startTime: new Date('2026-10-25T10:30:00.000Z'),
        endTime: new Date('2026-10-25T12:00:00.000Z'),
      },
    ]);
    mockPrisma.pricingRule.findMany.mockResolvedValue([]);
    mockPrisma.clubMembership.findFirst.mockResolvedValue(null);

    const result = await service.getAvailability('club-1', '2026-10-25');

    expect(result[0].slots[0].status).toBe(SlotStatus.AVAILABLE);
    expect(result[0].slots[1].status).toBe(SlotStatus.OCCUPIED);
  });
});
