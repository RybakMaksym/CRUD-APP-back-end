import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { NotificationType } from '@/enums/notification.enums';
import { NotificationController } from '@/notification/notification.controller';
import { NotificationService } from '@/notification/notification.service';
import type { INotification } from '@/notification/notification.types';

const mockNotificationService = () => ({
  getUserNotificationsWithPagination: jest.fn(),
});

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: ReturnType<typeof mockNotificationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useFactory: mockNotificationService,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get(NotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  const userId = '1';
  const mockNotifications: INotification[] = [
    {
      type: NotificationType.PROFILE_EDIT,
      message: 'Profile updated',
      ownerId: userId,
      isNew: false,
    },
  ];

  describe('getNotifications()', () => {
    it('should return paginated notifications', async () => {
      const page = 1;
      const limit = 5;
      const mockPaginated = {
        data: mockNotifications,
        page,
        limit,
        total: 1,
        nextPage: null,
      };
      service.getUserNotificationsWithPagination.mockResolvedValue(
        mockPaginated,
      );

      const result = await controller.getNotifications(userId, page, limit);

      expect(service.getUserNotificationsWithPagination).toHaveBeenCalledWith(
        userId,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginated);
    });

    it('should return paginated notifications with default page & limit', async () => {
      const page = 1;
      const limit = 10;
      const mockPaginated = {
        data: mockNotifications,
        page,
        limit,
        total: 1,
        nextPage: null,
      };
      service.getUserNotificationsWithPagination.mockResolvedValue(
        mockPaginated,
      );

      const result = await controller.getNotifications(userId.toString());

      expect(service.getUserNotificationsWithPagination).toHaveBeenCalledWith(
        userId,
        page,
        limit,
      );
      expect(result).toEqual(mockPaginated);
    });
  });
});
