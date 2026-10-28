import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { ClubRole } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;
  let configService: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed-password',
    firstName: 'Juan',
    lastName: 'Pérez',
    phone: '123456789',
    avatarUrl: null,
    isSuperAdmin: false,
    isActive: true,
    memberships: [
      {
        club: {
          id: 'club-1',
          name: 'Club Central',
          slug: 'club-central',
          city: 'Barcelona',
          isActive: true,
        },
        role: ClubRole.MEMBER,
        memberNumber: 'M-001',
        walletBalance: 25.5,
      },
    ],
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      club: {
        findMany: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-token'),
      sign: jest.fn().mockReturnValue('mock-access-token'),
      verify: jest.fn(),
    };

    configService = {
      get: jest.fn((key: string, defaultValue?: string) => defaultValue || 'mock-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        {
          provide: ActivityLogsService,
          useValue: { log: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('debe registrar un nuevo usuario y devolver tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Juan',
        lastName: 'Pérez',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(mockUser.email);
    });

    it('debe lanzar ConflictException si el email ya está en uso', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Juan',
          lastName: 'Pérez',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('debe hacer login exitoso y retornar tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result.user.id).toBe(mockUser.id);
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si la cuenta está desactivada', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(
        service.login({ email: 'test@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si la contraseña no coincide', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe mapear clubes para superadmin sin membresías directas', async () => {
      const superAdminUser = {
        ...mockUser,
        isSuperAdmin: true,
        memberships: [],
      };
      prisma.user.findUnique.mockResolvedValue(superAdminUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prisma.club.findMany.mockResolvedValue([
        { id: 'club-global', name: 'Global Club', slug: 'global', city: 'Madrid', isActive: true },
      ]);

      const result = await service.login({
        email: 'admin@example.com',
        password: 'password123',
      });

      expect(result.user.memberships.length).toBe(1);
      expect(result.user.memberships[0].clubId).toBe('club-global');
      expect(result.user.memberships[0].clubCity).toBe('Madrid');
    });
  });

  describe('refresh', () => {
    it('debe renovar el accessToken si el refresh token es válido', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        isSuperAdmin: false,
        isActive: true,
      });

      const result = await service.refresh('valid-refresh-token');
      expect(result).toHaveProperty('accessToken', 'mock-access-token');
    });

    it('debe lanzar UnauthorizedException si el refresh token es inválido', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.refresh('invalid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el usuario asociado al token no está activo', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        isSuperAdmin: false,
        isActive: false,
      });

      await expect(service.refresh('valid-refresh-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getMe', () => {
    it('debe retornar el perfil de usuario autenticado', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getMe('user-1');
      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@example.com');
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getMe('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
