import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EmailNotificationService } from './email-notification.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    EmailNotificationService,
  ],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
