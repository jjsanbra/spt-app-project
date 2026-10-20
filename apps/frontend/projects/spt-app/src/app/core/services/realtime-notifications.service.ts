import { Injectable, effect, inject, signal, computed, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { NotificationsService } from '../api/endpoints/notifications/notifications.service';
import { NotificationResponseDto } from '../api/model';

@Injectable({
  providedIn: 'root',
})
export class RealtimeNotificationsService implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly notificationsApiService = inject(NotificationsService);
  private readonly notificationUiService = inject(NotificationService);

  private socket: Socket | null = null;

  readonly notifications = signal<NotificationResponseDto[]>([]);
  readonly isLoading = signal<boolean>(false);

  readonly unreadCount = computed(
    () => this.notifications().filter((n) => !n.isRead).length
  );

  constructor() {
    // Sincronizar conexión Socket cuando cambie el estado de autenticación
    effect(() => {
      const isAuth = this.authService.isAuthenticated();
      if (isAuth) {
        this.loadNotifications();
        this.connect();
      } else {
        this.disconnect();
        this.notifications.set([]);
      }
    });
  }

  /**
   * Cargar notificaciones del usuario desde la API REST
   */
  loadNotifications(): void {
    this.isLoading.set(true);
    this.notificationsApiService
      .notificationsControllerFindMyNotifications()
      .subscribe({
        next: (res) => {
          this.notifications.set(res.items);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Conectar WebSocket a /notifications con el token JWT
   */
  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const token = this.authService.getAccessToken();
    if (!token) {
      return;
    }

    this.socket = io('/notifications', {
      transports: ['websocket', 'polling'],
      auth: { token },
      autoConnect: true,
    });

    this.socket.on('notification:new', (newNotification: NotificationResponseDto) => {
      this.notifications.update((prev) => [newNotification, ...prev]);

      // Notificación emergente Toast global
      this.notificationUiService.info(
        newNotification.message,
        newNotification.title,
        undefined,
        5000
      );
    });
  }

  /**
   * Desconectar el socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Marcar una notificación individual como leída
   */
  markAsRead(id: string): void {
    // Actualización optimista
    this.notifications.update((items) =>
      items.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    this.notificationsApiService
      .notificationsControllerMarkAsRead(id)
      .subscribe({
        error: () => {
          // Revertir si falla
          this.loadNotifications();
        },
      });
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  markAllAsRead(): void {
    // Actualización optimista
    this.notifications.update((items) =>
      items.map((n) => ({ ...n, isRead: true }))
    );

    this.notificationsApiService
      .notificationsControllerMarkAllAsRead()
      .subscribe({
        error: () => {
          this.loadNotifications();
        },
      });
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
