import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClubRole, PaymentMode } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { SuperAdminClubsService } from './superadmin-clubs.service';

describe('SuperAdminClubsService', () => {
  let service: SuperAdminClubsService;

  const mockClub = {
    id: 'club-uuid-1',
    name: 'Club Las Rozas',
    slug: 'las-rozas',
    description: 'Club moderno',
    email: 'contacto@lasrozas.local',
    phone: '+34910000002',
    address: 'Calle Deporte 10',
    city: 'Madrid',
    postalCode: '28230',
    openingHour: 8,
    closingHour: 23,
    slotDurationMinutes: 60,
    openGameMinNoticeHours: 2,
    paymentMode: PaymentMode.PRESENTIAL,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      facilities: 4,
      memberships: 15,
    },
  };

  const mockPrisma = {
    club: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    clubMembership: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuperAdminClubsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<SuperAdminClubsService>(SuperAdminClubsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('debe listar clubes con conteos y formato correcto', async () => {
      mockPrisma.club.findMany.mockResolvedValue([mockClub]);

      const result = await service.findAll('rozas', true);

      expect(mockPrisma.club.findMany).toHaveBeenCalled();
      expect(result.items).toHaveLength(1);
      expect(result.items[0].facilitiesCount).toBe(4);
      expect(result.items[0].membersCount).toBe(15);
      expect(result.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('debe devolver un club si existe', async () => {
      mockPrisma.club.findUnique.mockResolvedValue(mockClub);

      const result = await service.findById('club-uuid-1');

      expect(result.id).toBe('club-uuid-1');
      expect(result.name).toBe('Club Las Rozas');
    });

    it('debe lanzar NotFoundException si no existe el club', async () => {
      mockPrisma.club.findUnique.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createClub', () => {
    it('debe rechazar si la hora de apertura es mayor o igual a la de cierre', async () => {
      await expect(
        service.createClub({
          name: 'Club Test',
          slug: 'club-test',
          email: 'test@club.com',
          openingHour: 23,
          closingHour: 8,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar si el slug ya está en uso', async () => {
      mockPrisma.club.findUnique.mockResolvedValue(mockClub);

      await expect(
        service.createClub({
          name: 'Club Las Rozas 2',
          slug: 'las-rozas',
          email: 'test@club.com',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('debe crear el club y vincular al propietario si se indica ownerEmail', async () => {
      mockPrisma.club.findUnique
        .mockResolvedValueOnce(null) // Para verificar slug
        .mockResolvedValueOnce(mockClub); // Para el findById final

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        const txMock = {
          club: {
            create: jest.fn().mockResolvedValue(mockClub),
          },
          user: {
            findUnique: jest.fn().mockResolvedValue({ id: 'user-owner-1', email: 'owner@club.com' }),
            create: jest.fn(),
          },
          clubMembership: {
            create: jest.fn().mockResolvedValue({ id: 'mem-1' }),
          },
        };
        return callback(txMock);
      });

      const result = await service.createClub({
        name: 'Club Las Rozas',
        slug: 'las-rozas',
        email: 'contacto@lasrozas.local',
        ownerEmail: 'owner@club.com',
      });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result.id).toBe('club-uuid-1');
    });
  });

  describe('toggleStatus', () => {
    it('debe alternar el estado isActive del club', async () => {
      mockPrisma.club.findUnique
        .mockResolvedValueOnce(mockClub) // Para comprobar existencia
        .mockResolvedValueOnce({ ...mockClub, isActive: false }); // Para el findById final

      mockPrisma.club.update.mockResolvedValue({ ...mockClub, isActive: false });

      const result = await service.toggleStatus('club-uuid-1');

      expect(mockPrisma.club.update).toHaveBeenCalledWith({
        where: { id: 'club-uuid-1' },
        data: { isActive: false },
      });
      expect(result.isActive).toBe(false);
    });
  });
});
