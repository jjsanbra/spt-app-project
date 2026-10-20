import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  NotificationListResponseDto,
  NotificationResponseDto,
} from './dto/notification-response.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener notificaciones del usuario autenticado con conteo de no leídas' })
  @ApiResponse({ status: 200, type: NotificationListResponseDto })
  async findMyNotifications(
    @CurrentUser('id') userId: string,
  ): Promise<NotificationListResponseDto> {
    return this.notificationsService.findUserNotifications(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar una notificación específica como leída' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') notificationId: string,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.markAsRead(userId, notificationId);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar todas las notificaciones del usuario como leídas' })
  @ApiResponse({ status: 200, description: 'Todas las notificaciones marcadas como leídas' })
  async markAllAsRead(
    @CurrentUser('id') userId: string,
  ): Promise<{ success: boolean; updatedCount: number }> {
    return this.notificationsService.markAllAsRead(userId);
  }
}
