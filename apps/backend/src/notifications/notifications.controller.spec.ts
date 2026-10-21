import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsService: {
    findUserNotifications: jest.Mock;
    markAsRead: jest.Mock;
    markAllAsRead: jest.Mock;
  };

  const userId = 'user-uuid-1';

  beforeEach(async () => {
    notificationsService = {
      findUserNotifications: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: notificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findMyNotifications debe delegar en notificationsService.findUserNotifications', async () => {
    notificationsService.findUserNotifications.mockResolvedValue({ items: [], unreadCount: 0 });

    const result = await controller.findMyNotifications(userId);
    expect(notificationsService.findUserNotifications).toHaveBeenCalledWith(userId);
    expect(result.unreadCount).toBe(0);
  });

  it('markAsRead debe delegar en notificationsService.markAsRead', async () => {
    notificationsService.markAsRead.mockResolvedValue({ id: 'notif-1', isRead: true });

    const result = await controller.markAsRead(userId, 'notif-1');
    expect(notificationsService.markAsRead).toHaveBeenCalledWith(userId, 'notif-1');
    expect(result.isRead).toBe(true);
  });

  it('markAllAsRead debe delegar en notificationsService.markAllAsRead', async () => {
    notificationsService.markAllAsRead.mockResolvedValue({ success: true, updatedCount: 5 });

    const result = await controller.markAllAsRead(userId);
    expect(notificationsService.markAllAsRead).toHaveBeenCalledWith(userId);
    expect(result.updatedCount).toBe(5);
  });
});
