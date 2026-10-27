import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { NotificationBellComponent } from './notification-bell.component';
import { RealtimeNotificationsService } from '../../core';
import { NotificationResponseDto } from '../../core/api/model';

describe('NotificationBellComponent', () => {
  let component: NotificationBellComponent;
  let fixture: ComponentFixture<NotificationBellComponent>;

  const mockNotifications = signal<NotificationResponseDto[]>([
    {
      id: 'notif-1',
      clubId: 'club-1',
      userId: 'user-1',
      title: 'Reserva confirmada',
      message: 'Tu reserva ha sido confirmada.',
      type: 'BOOKING_CONFIRMED',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'notif-2',
      clubId: 'club-1',
      userId: 'user-1',
      title: 'Partida completa',
      message: 'La partida está completa.',
      type: 'OPEN_GAME_COMPLETE',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const mockNotificationsService = {
    notifications: mockNotifications,
    unreadCount: signal(1),
    isLoading: signal(false),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    loadNotifications: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationBellComponent],
      providers: [
        provideHttpClient(),
        provideTranslateService({ lang: 'es' }),
        {
          provide: RealtimeNotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationBellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the notification bell component', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct icons for notification types', () => {
    expect(component.getNotificationIcon('BOOKING_CONFIRMED')).toContain('pi-check-circle');
    expect(component.getNotificationIcon('BOOKING_CANCELLED')).toContain('pi-calendar-times');
    expect(component.getNotificationIcon('OPEN_GAME_JOINED')).toContain('pi-user-plus');
    expect(component.getNotificationIcon('OPEN_GAME_COMPLETE')).toContain('pi-users');
    expect(component.getNotificationIcon('PAYMENT_RECEIVED')).toContain('pi-credit-card');
    expect(component.getNotificationIcon('UNKNOWN')).toContain('pi-bell');
  });

  it('should delegate markAsRead to service if notification is unread', () => {
    const unread = mockNotifications()[0];
    component.onMarkAsRead(unread);
    expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith('notif-1');
  });

  it('should not delegate markAsRead if notification is already read', () => {
    mockNotificationsService.markAsRead.mockClear();
    const read = mockNotifications()[1];
    component.onMarkAsRead(read);
    expect(mockNotificationsService.markAsRead).not.toHaveBeenCalled();
  });

  it('should delegate markAllAsRead to service', () => {
    component.onMarkAllAsRead();
    expect(mockNotificationsService.markAllAsRead).toHaveBeenCalled();
  });

  it('should format recent times properly', () => {
    const nowIso = new Date().toISOString();
    const formatted = component.formatTime(nowIso);
    expect(formatted).toBeDefined();
  });
});
