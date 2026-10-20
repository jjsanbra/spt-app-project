import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { EmailNotificationService } from './email-notification.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockPrisma: any;
  let mockGateway: any;
  let mockEmailService: any;

  const mockNotification = {
    id: 'notif-1',
    clubId: 'club-1',
    userId: 'user-1',
    title: '¡Reserva confirmada!',
    message: 'Tu reserva en Pista 1 ha sido confirmada.',
    type: NotificationType.BOOKING_CONFIRMED,
    isRead: false,
    metadata: { bookingId: 'book-1' },
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockPrisma = {
      notification: {
        create: jest.fn().mockResolvedValue(mockNotification),
        findMany: jest.fn().mockResolvedValue([mockNotification]),
        findFirst: jest.fn().mockResolvedValue(mockNotification),
        count: jest.fn().mockResolvedValue(1),
        update: jest.fn().mockResolvedValue({ ...mockNotification, isRead: true }),
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };

    mockGateway = {
      sendToUser: jest.fn(),
      sendToClub: jest.fn(),
    };

    mockEmailService = {
      sendEmail: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsGateway, useValue: mockGateway },
        { provide: EmailNotificationService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe crear una notificación, persistirla y emitirla por WebSocket', async () => {
    const result = await service.createNotification({
      userId: 'user-1',
      clubId: 'club-1',
      title: '¡Reserva confirmada!',
      message: 'Tu reserva en Pista 1 ha sido confirmada.',
      type: NotificationType.BOOKING_CONFIRMED,
      metadata: { bookingId: 'book-1' },
    });

    expect(mockPrisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          title: '¡Reserva confirmada!',
          isRead: false,
        }),
      }),
    );
    expect(mockGateway.sendToUser).toHaveBeenCalledWith('user-1', 'notification:new', expect.objectContaining({ id: 'notif-1' }));
    expect(result.id).toBe('notif-1');
  });

  it('debe enviar email transaccional si sendEmail es true y se proporciona userEmail', async () => {
    await service.createNotification({
      userId: 'user-1',
      title: 'Aviso',
      message: 'Detalle',
      type: NotificationType.SYSTEM,
      sendEmail: true,
      userEmail: 'socio@club.com',
    });

    expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'socio@club.com',
        subject: 'Aviso',
      }),
    );
  });

  it('debe listar las notificaciones del usuario y devolver el conteo de no leídas', async () => {
    const result = await service.findUserNotifications('user-1');

    expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
    expect(mockPrisma.notification.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1', isRead: false } }),
    );
    expect(result.items.length).toBe(1);
    expect(result.unreadCount).toBe(1);
  });

  it('debe marcar una notificación específica como leída', async () => {
    const result = await service.markAsRead('user-1', 'notif-1');

    expect(mockPrisma.notification.update).toHaveBeenCalledWith({
      where: { id: 'notif-1' },
      data: { isRead: true },
    });
    expect(result.isRead).toBe(true);
  });

  it('debe lanzar NotFoundException si la notificación no pertenece al usuario', async () => {
    mockPrisma.notification.findFirst.mockResolvedValue(null);

    await expect(service.markAsRead('user-1', 'non-existent')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('debe marcar todas las notificaciones como leídas y emitir evento de sincronización', async () => {
    const result = await service.markAllAsRead('user-1');

    expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', isRead: false },
      data: { isRead: true },
    });
    expect(mockGateway.sendToUser).toHaveBeenCalledWith('user-1', 'notifications:read-all', { unreadCount: 0 });
    expect(result.success).toBe(true);
    expect(result.updatedCount).toBe(2);
  });
});
