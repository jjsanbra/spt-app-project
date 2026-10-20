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
});
