import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { PopoverModule } from 'primeng/popover';
import { RealtimeNotificationsService } from '../../core';
import { NotificationResponseDto } from '../../core/api/model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    ButtonModule,
    BadgeModule,
    OverlayBadgeModule,
    PopoverModule,
  ],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss'],
})
export class NotificationBellComponent {
  readonly notificationsService = inject(RealtimeNotificationsService);
  private readonly translate = inject(TranslateService);

  readonly notifications = this.notificationsService.notifications;
  readonly unreadCount = this.notificationsService.unreadCount;
  readonly isLoading = this.notificationsService.isLoading;

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'BOOKING_CONFIRMED':
        return 'pi pi-check-circle notif-icon-success';
      case 'BOOKING_CANCELLED':
        return 'pi pi-calendar-times notif-icon-danger';
      case 'OPEN_GAME_JOINED':
        return 'pi pi-user-plus notif-icon-info';
      case 'OPEN_GAME_COMPLETE':
        return 'pi pi-users notif-icon-primary';
      case 'PAYMENT_RECEIVED':
        return 'pi pi-credit-card notif-icon-emerald';
      default:
        return 'pi pi-bell notif-icon-muted';
    }
  }


  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) {
      return this.translate.instant('NOTIFICATIONS.JUST_NOW');
    }
    if (diffMinutes < 60) {
      return this.translate.instant('NOTIFICATIONS.MINUTES_AGO', { min: diffMinutes });
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return this.translate.instant('NOTIFICATIONS.HOURS_AGO', { hours: diffHours });
    }
    const diffDays = Math.floor(diffHours / 24);
    return this.translate.instant('NOTIFICATIONS.DAYS_AGO', { days: diffDays });
  }

  onMarkAsRead(notif: NotificationResponseDto): void {
    if (!notif.isRead) {
      this.notificationsService.markAsRead(notif.id);
    }
  }

  onMarkAllAsRead(): void {
    this.notificationsService.markAllAsRead();
  }
}
