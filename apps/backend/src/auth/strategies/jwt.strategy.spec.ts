import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../core/database/prisma.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: {
    user: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test_secret_key_at_least_32_characters_long'),
          },
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        strategy.validate({ sub: 'u-none', email: 'test@example.com', isSuperAdmin: false }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el usuario está inactivo', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u-inactive',
        email: 'inactive@example.com',
        isSuperAdmin: false,
        isActive: false,
      });

      await expect(
        strategy.validate({ sub: 'u-inactive', email: 'inactive@example.com', isSuperAdmin: false }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe retornar los datos del usuario si está activo', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'u-active',
        email: 'active@example.com',
        isSuperAdmin: true,
        isActive: true,
      });

      const result = await strategy.validate({
        sub: 'u-active',
        email: 'active@example.com',
        isSuperAdmin: true,
      });

      expect(result).toEqual({
        id: 'u-active',
        email: 'active@example.com',
        isSuperAdmin: true,
      });
    });
  });
});
