import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CreateNotificationInput } from './dto/create-notification.dto';
import {
  NotificationListResponseDto,
  NotificationResponseDto,
} from './dto/notification-response.dto';
import { EmailNotificationService } from './email-notification.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationsGateway,
    private readonly emailService: EmailNotificationService,
  ) {}

  /**
   * Crear y emitir una nueva notificación (persistencia + WebSocket + opcional Email)
   */
  async createNotification(input: CreateNotificationInput): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: input.userId,
        clubId: input.clubId ?? null,
        title: input.title,
        message: input.message,
        type: input.type,
        metadata: input.metadata ?? undefined,
        isRead: false,
      },
    });

    const responseDto: NotificationResponseDto = {
      id: notification.id,
      clubId: notification.clubId,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      metadata: notification.metadata as any,
      createdAt: notification.createdAt,
    };

    // 1. Emitir en tiempo real a la sala privada del usuario por WebSocket
    this.gateway.sendToUser(input.userId, 'notification:new', responseDto);

    // 2. Envío de correo electrónico transaccional si procede
    if (input.sendEmail && input.userEmail) {
      this.emailService.sendEmail({
        to: input.userEmail,
        subject: input.title,
        html: `<p><strong>${input.title}</strong></p><p>${input.message}</p>`,
      });
    }

    return responseDto;
  }

  /**
   * Obtener notificaciones del usuario con contador de no leídas
   */
  async findUserNotifications(userId: string): Promise<NotificationListResponseDto> {
    const [items, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      items: items.map((n) => ({
        id: n.id,
        clubId: n.clubId,
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        metadata: n.metadata as any,
        createdAt: n.createdAt,
      })),
      unreadCount,
    };
  }

  /**
   * Marcar notificación individual como leída
   */
  async markAsRead(userId: string, notificationId: string): Promise<NotificationResponseDto> {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    const updated = await this.prisma.notification.update({
      where: { id: notification.id },
      data: { isRead: true },
    });

    return {
      id: updated.id,
      clubId: updated.clubId,
      userId: updated.userId,
      title: updated.title,
      message: updated.message,
      type: updated.type,
      isRead: updated.isRead,
      metadata: updated.metadata as any,
      createdAt: updated.createdAt,
    };
  }

  /**
   * Marcar todas las notificaciones del usuario como leídas
   */
  async markAllAsRead(userId: string): Promise<{ success: boolean; updatedCount: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    // Notificar al socket para sincronizar cualquier otra pestaña del usuario
    this.gateway.sendToUser(userId, 'notifications:read-all', { unreadCount: 0 });

    return {
      success: true,
      updatedCount: result.count,
    };
  }
}
