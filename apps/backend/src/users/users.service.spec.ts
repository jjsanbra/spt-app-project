import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../core/database/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    booking: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      booking: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateProfile', () => {
    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('non-existent', { firstName: 'Juan' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe actualizar el perfil y formatear membresias activas correctamente', async () => {
      const existingUser = { id: 'u1', email: 'test@example.com' };
      prisma.user.findUnique.mockResolvedValue(existingUser);

      const updatedUser = {
        id: 'u1',
        email: 'test@example.com',
        firstName: 'Carlos',
        lastName: 'García',
        phone: '600123456',
        avatarUrl: 'https://example.com/avatar.png',
        isSuperAdmin: false,
        memberships: [
          {
            club: { id: 'c1', name: 'Club Padel', slug: 'club-padel', isActive: true },
            role: 'MEMBER',
            memberNumber: 'SOC-001',
            walletBalance: 25.5,
          },
          {
            club: { id: 'c2', name: 'Club Inactivo', slug: 'club-inactivo', isActive: false },
            role: 'MEMBER',
            memberNumber: 'SOC-002',
            walletBalance: 0,
          },
        ],
      };
      prisma.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('u1', {
        firstName: 'Carlos',
        lastName: 'García',
        phone: '600123456',
        avatarUrl: 'https://example.com/avatar.png',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: {
          firstName: 'Carlos',
          lastName: 'García',
          phone: '600123456',
          avatarUrl: 'https://example.com/avatar.png',
        },
        include: expect.any(Object),
      });

      expect(result.firstName).toBe('Carlos');
      expect(result.memberships).toHaveLength(1);
      expect(result.memberships[0].clubId).toBe('c1');
      expect(result.memberships[0].walletBalance).toBe(25.5);
    });
  });

  describe('getDashboard', () => {
    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getDashboard('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('debe retornar métricas del usuario y próxima reserva', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'u1' });

      const now = new Date();
      prisma.booking.findFirst.mockResolvedValue({
        id: 'bk-1',
        startTime: now,
        endTime: new Date(now.getTime() + 90 * 60000),
        facility: {
          name: 'Pista Central',
          sportType: 'PADEL',
        },
      });

      prisma.booking.findMany.mockResolvedValue([
        {
          totalPrice: 20,
          startTime: now,
          endTime: new Date(now.getTime() + 90 * 60000),
        },
      ]);

      prisma.booking.count.mockResolvedValue(2);

      const result = await service.getDashboard('u1');

      expect(result).toBeDefined();
      expect(result.nextBooking).toBeDefined();
      expect(result.nextBooking?.facilityName).toBe('Pista Central');
      expect(result.monthlyStats.matchesPlayed).toBe(1);
      expect(result.monthlyStats.hoursPlayed).toBe(1.5);
      expect(result.monthlyStats.totalSpent).toBe(20);
      expect(result.activityHistory).toHaveLength(4);
    });
  });
});
