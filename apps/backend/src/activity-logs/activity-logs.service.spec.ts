import { Test, TestingModule } from '@nestjs/testing';
import { ActivityAction } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { ActivityLogsService } from './activity-logs.service';

describe('ActivityLogsService', () => {
  let service: ActivityLogsService;
  let prisma: {
    activityLog: {
      create: jest.Mock;
      count: jest.Mock;
      findMany: jest.Mock;
    };
  };

  const mockLogRecord = {
    id: 'log-1',
    clubId: 'club-1',
    userId: 'user-1',
    action: ActivityAction.BOOKING_CREATED,
    entityType: 'Booking',
    entityId: 'booking-1',
    summary: 'Reserva creada para Pista 1',
    metadata: { facilityName: 'Pista 1' },
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    createdAt: new Date('2026-10-26T10:00:00Z'),
    user: {
      id: 'user-1',
      firstName: 'Carlos',
      lastName: 'Sanz',
      email: 'carlos@example.com',
      avatarUrl: null,
    },
  };

  beforeEach(async () => {
    prisma = {
      activityLog: {
        create: jest.fn().mockResolvedValue(mockLogRecord),
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([mockLogRecord]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityLogsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ActivityLogsService>(ActivityLogsService);
  });

  describe('log', () => {
    it('debe persistir el log de auditoría correctamente', async () => {
      await service.log({
        clubId: 'club-1',
        userId: 'user-1',
        action: ActivityAction.BOOKING_CREATED,
        entityType: 'Booking',
        entityId: 'booking-1',
        summary: 'Reserva creada para Pista 1',
        metadata: { facilityName: 'Pista 1' },
      });

      expect(prisma.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clubId: 'club-1',
          userId: 'user-1',
          action: ActivityAction.BOOKING_CREATED,
          entityType: 'Booking',
          summary: 'Reserva creada para Pista 1',
        }),
      });
    });

    it('no debe lanzar excepción si falla la persistencia en base de datos (resiliencia)', async () => {
      prisma.activityLog.create.mockRejectedValue(new Error('Fallo de conexión en DB'));

      await expect(
        service.log({
          clubId: 'club-1',
          action: ActivityAction.BOOKING_CANCELLED,
          entityType: 'Booking',
          summary: 'Reserva cancelada',
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('findClubLogs', () => {
    it('debe devolver registros paginados de un club con filtros aplicados', async () => {
      const result = await service.findClubLogs('club-1', {
        page: 1,
        limit: 10,
        action: ActivityAction.BOOKING_CREATED,
        entityType: 'Booking',
        userId: 'user-1',
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        search: 'Reserva',
      });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0].user?.fullName).toBe('Carlos Sanz');
      expect(prisma.activityLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            clubId: 'club-1',
            action: ActivityAction.BOOKING_CREATED,
          }),
          skip: 0,
          take: 10,
        }),
      );
    });
  });

  describe('findUserLogs', () => {
    it('debe devolver registros propios del usuario en el club activo', async () => {
      const result = await service.findUserLogs('user-1', 'club-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(prisma.activityLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-1',
            clubId: 'club-1',
          }),
        }),
      );
    });
  });

  describe('findSuperAdminLogs', () => {
    it('debe permitir consulta global transversal de logs', async () => {
      const result = await service.findSuperAdminLogs({ page: 2, limit: 15 });

      expect(result.page).toBe(2);
      expect(prisma.activityLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 15,
          take: 15,
        }),
      );
    });
  });
});
