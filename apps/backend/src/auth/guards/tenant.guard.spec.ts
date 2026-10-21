import { BadRequestException, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../core/database/prisma.service';
import { TenantGuard } from './tenant.guard';

describe('TenantGuard', () => {
  let guard: TenantGuard;
  let prisma: {
    club: { findFirst: jest.Mock };
    clubMembership: { findUnique: jest.Mock };
  };

  const createMockContext = (requestData: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => requestData,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    prisma = {
      club: { findFirst: jest.fn() },
      clubMembership: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantGuard,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    guard = module.get<TenantGuard>(TenantGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('debe lanzar ForbiddenException si no hay usuario autenticado', async () => {
    const context = createMockContext({ headers: {} });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('debe lanzar BadRequestException si no hay x-tenant-id y no es superadmin', async () => {
    const context = createMockContext({
      user: { id: 'u1', isSuperAdmin: false },
      headers: {},
    });

    await expect(guard.canActivate(context)).rejects.toThrow(BadRequestException);
  });

  it('debe permitir acceso al SuperAdmin con tenantId explícito', async () => {
    const request = {
      user: { id: 'sa1', isSuperAdmin: true },
      headers: { 'x-tenant-id': 'club-1' },
      tenant: null as any,
    };
    const context = createMockContext(request);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.tenant).toEqual({
      clubId: 'club-1',
      role: 'OWNER',
      isSuperAdminOverride: true,
    });
  });

  it('debe resolver club por defecto si SuperAdmin no envía x-tenant-id', async () => {
    prisma.club.findFirst.mockResolvedValue({ id: 'club-default' });
    const request = {
      user: { id: 'sa1', isSuperAdmin: true },
      headers: {},
      tenant: null as any,
    };
    const context = createMockContext(request);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.tenant.clubId).toBe('club-default');
  });

  it('debe lanzar ForbiddenException si el usuario no tiene membresía en el club', async () => {
    prisma.clubMembership.findUnique.mockResolvedValue(null);
    const context = createMockContext({
      user: { id: 'u1', isSuperAdmin: false },
      headers: { 'x-tenant-id': 'club-1' },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('debe lanzar ForbiddenException si la membresía o el club están inactivos', async () => {
    prisma.clubMembership.findUnique.mockResolvedValue({
      id: 'm1',
      isActive: false,
      club: { id: 'club-1', isActive: true },
    });
    const context = createMockContext({
      user: { id: 'u1', isSuperAdmin: false },
      headers: { 'x-tenant-id': 'club-1' },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('debe permitir acceso y poblar request.tenant cuando la membresía está activa', async () => {
    prisma.clubMembership.findUnique.mockResolvedValue({
      id: 'm1',
      role: 'ADMIN',
      isActive: true,
      club: { id: 'club-1', isActive: true, name: 'Club Central' },
    });
    const request = {
      user: { id: 'u1', isSuperAdmin: false },
      headers: { 'x-tenant-id': 'club-1' },
      tenant: null as any,
    };
    const context = createMockContext(request);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.tenant).toEqual({
      clubId: 'club-1',
      role: 'ADMIN',
      membershipId: 'm1',
    });
  });
});
