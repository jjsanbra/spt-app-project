import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ActivityAction } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { ActivityLogsController } from './activity-logs.controller';
import { ActivityLogsService } from './activity-logs.service';

describe('ActivityLogsController', () => {
  let controller: ActivityLogsController;
  let service: {
    findClubLogs: jest.Mock;
    findUserLogs: jest.Mock;
    findSuperAdminLogs: jest.Mock;
  };

  const mockResponse = {
    data: [
      {
        id: 'log-1',
        clubId: 'club-1',
        userId: 'user-1',
        action: ActivityAction.BOOKING_CREATED,
        entityType: 'Booking',
        entityId: 'booking-1',
        summary: 'Reserva creada',
        metadata: null,
        ipAddress: null,
        userAgent: null,
        createdAt: '2026-10-26T10:00:00.000Z',
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  beforeEach(async () => {
    service = {
      findClubLogs: jest.fn().mockResolvedValue(mockResponse),
      findUserLogs: jest.fn().mockResolvedValue(mockResponse),
      findSuperAdminLogs: jest.fn().mockResolvedValue(mockResponse),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityLogsController],
      providers: [
        { provide: ActivityLogsService, useValue: service },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<ActivityLogsController>(ActivityLogsController);
  });

  describe('findClubLogs', () => {
    it('debe invocar a service.findClubLogs con el clubId del tenant', async () => {
      const result = await controller.findClubLogs('club-1', 'club-1', { page: 1 });

      expect(service.findClubLogs).toHaveBeenCalledWith('club-1', { page: 1 });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findMyLogs', () => {
    it('debe invocar a service.findUserLogs con el id del usuario autenticado', async () => {
      const result = await controller.findMyLogs('user-1', 'club-1', { limit: 10 });

      expect(service.findUserLogs).toHaveBeenCalledWith('user-1', 'club-1', { limit: 10 });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('findSuperAdminLogs', () => {
    it('debe permitir consulta si el usuario es superadmin', async () => {
      const result = await controller.findSuperAdminLogs({ isSuperAdmin: true }, { page: 1 });

      expect(service.findSuperAdminLogs).toHaveBeenCalledWith({ page: 1 });
      expect(result).toEqual(mockResponse);
    });

    it('debe lanzar ForbiddenException si el usuario no es superadmin', async () => {
      await expect(
        controller.findSuperAdminLogs({ isSuperAdmin: false }, {}),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
