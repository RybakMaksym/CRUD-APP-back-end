import { getModelToken } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Types } from 'mongoose';

import { NotificationType } from '@/enums/notification.enums';
import { Notification } from '@/notification/models/notification.model';
import { NotificationService } from '@/notification/notification.service';
import type { INotification } from '@/notification/notification.types';

const mockNotificationModel = () => ({
  create: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
});

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationModel: ReturnType<typeof mockNotificationModel>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getModelToken(Notification.name),
          useFactory: mockNotificationModel,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notificationModel = module.get(getModelToken(Notification.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification()', () => {
    it('should create and return notification', async () => {
      const dto: INotification = {
        type: NotificationType.PROFILE_EDIT,
        message: 'Profile updated',
        ownerId: new Types.ObjectId('64a987654321fedcba654321'),
      };
      notificationModel.create.mockResolvedValue(dto);

      const result = await service.createNotification(dto);

      expect(notificationModel.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(dto);
    });
  });

  describe('getUserNotificationsWithPagination()', () => {
    it('should return paginated notifications', async () => {
      const userId = 'user-id';
      const page = 1;
      const limit = 2;
      const mockNotifications = [
        {
          type: 'PROFILE_EDIT',
          message: 'Profile edited',
          ownerId: userId,
          createdAt: new Date(),
        },
        {
          type: 'PROFILE_DELETE',
          message: 'Profile deleted',
          ownerId: userId,
          createdAt: new Date(),
        },
      ];
      notificationModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockNotifications),
            }),
          }),
        }),
      });
      notificationModel.countDocuments.mockResolvedValue(5);

      const result = await service.getUserNotificationsWithPagination(
        userId,
        page,
        limit,
      );

      expect(notificationModel.find).toHaveBeenCalledWith({ ownerId: userId });
      expect(notificationModel.countDocuments).toHaveBeenCalledWith({
        ownerId: userId,
      });
      expect(result).toEqual({
        data: mockNotifications,
        page,
        limit,
        total: 5,
        nextPage: 2,
      });
    });

    it('should return nextPage as null when on last page', async () => {
      const userId = 'user-id';
      const page = 2;
      const limit = 5;
      notificationModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      });
      notificationModel.countDocuments.mockResolvedValue(10);

      const result = await service.getUserNotificationsWithPagination(
        userId,
        page,
        limit,
      );

      expect(result.nextPage).toBeNull();
    });
  });
});
