import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class NotificationResponseDto {
  @ApiProperty({ example: 'notif-uuid-1' })
  id: string;

  @ApiPropertyOptional({ example: 'club-uuid-1', type: String, nullable: true })
  clubId?: string | null;

  @ApiProperty({ example: 'user-uuid-1' })
  userId: string;

  @ApiProperty({ example: '¡Reserva confirmada!' })
  title: string;

  @ApiProperty({ example: 'Tu reserva en Pista 1 Central para el 25 Oct a las 18:00 ha sido confirmada.' })
  message: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.BOOKING_CONFIRMED })
  type: NotificationType;

  @ApiProperty({ example: false, description: 'Indica si el usuario ya ha leído la notificación' })
  isRead: boolean;

  @ApiPropertyOptional({ example: { bookingId: 'book-1' }, nullable: true })
  metadata?: Record<string, any> | null;

  @ApiProperty({ example: '2026-10-20T14:00:00.000Z' })
  createdAt: Date;
}

export class NotificationListResponseDto {
  @ApiProperty({ type: [NotificationResponseDto] })
  items: NotificationResponseDto[];

  @ApiProperty({ example: 3, description: 'Número total de notificaciones pendientes de leer' })
  unreadCount: number;
}
