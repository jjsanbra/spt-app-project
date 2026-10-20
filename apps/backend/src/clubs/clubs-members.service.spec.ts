import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClubRole } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { ClubsMembersService } from './clubs-members.service';

describe('ClubsMembersService', () => {
  let service: ClubsMembersService;
  let prisma: any;

  const mockPrisma = {
    clubMembership: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClubsMembersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ClubsMembersService>(ClubsMembersService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  const clubId = 'club-uuid-1';
  const memberId = 'membership-uuid-1';
  const userId = 'user-uuid-1';

  it('debe listar los miembros del club mapeando el saldo numérico', async () => {
    const rawMembership = {
      id: memberId,
      userId,
      clubId,
      role: ClubRole.ADMIN,
      walletBalance: '15.50',
      memberNumber: 'SOCIO-1',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: userId,
        email: 'admin@club.com',
        firstName: 'Admin',
        lastName: 'Test',
        phone: null,
        avatarUrl: null,
      },
    };

    mockPrisma.clubMembership.findMany.mockResolvedValue([rawMembership]);

    const result = await service.findAll(clubId);

    expect(result).toHaveLength(1);
    expect(result[0].walletBalance).toBe(15.5);
    expect(result[0].role).toBe(ClubRole.ADMIN);
    expect(mockPrisma.clubMembership.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ clubId }),
      }),
    );
  });

  it('debe lanzar ConflictException si el usuario ya es miembro al invitar', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: userId, email: 'user@club.com' });
    mockPrisma.clubMembership.findUnique.mockResolvedValue({ id: memberId });

    await expect(
      service.invite(clubId, { email: 'user@club.com', role: ClubRole.MEMBER }),
    ).rejects.toThrow(ConflictException);
  });

  it('debe impedir cambiar el rol de un OWNER si es el único activo', async () => {
    mockPrisma.clubMembership.findFirst.mockResolvedValue({
      id: memberId,
      clubId,
      role: ClubRole.OWNER,
    });
    mockPrisma.clubMembership.count.mockResolvedValue(0); // 0 otros owners

    await expect(
      service.updateRole(clubId, memberId, { role: ClubRole.ADMIN }),
    ).rejects.toThrow(BadRequestException);
  });

  it('debe permitir cambiar el rol si existen más propietarios (OWNER)', async () => {
    mockPrisma.clubMembership.findFirst.mockResolvedValue({
      id: memberId,
      clubId,
      role: ClubRole.OWNER,
    });
    mockPrisma.clubMembership.count.mockResolvedValue(1); // hay otro owner
    mockPrisma.clubMembership.update.mockResolvedValue({
      id: memberId,
      userId,
      clubId,
      role: ClubRole.ADMIN,
      walletBalance: 0,
      memberNumber: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { id: userId, email: 'owner@club.com', firstName: 'Owner', lastName: 'User', phone: null, avatarUrl: null },
    });

    const result = await service.updateRole(clubId, memberId, { role: ClubRole.ADMIN });

    expect(result.role).toBe(ClubRole.ADMIN);
  });

  it('debe lanzar NotFoundException si la membresía no existe o no pertenece al club', async () => {
    mockPrisma.clubMembership.findFirst.mockResolvedValue(null);

    await expect(
      service.updateRole(clubId, 'non-existent', { role: ClubRole.ADMIN }),
    ).rejects.toThrow(NotFoundException);
  });
});
