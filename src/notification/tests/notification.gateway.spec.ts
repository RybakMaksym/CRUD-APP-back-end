import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { Server, Socket } from 'socket.io';

import {
  NotificationEvents,
  NotificationType,
} from '@/enums/notification.enums';
import { NotificationGateway } from '@/notification/notification.gateway';
import type { INotification } from '@/notification/notification.types';

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationGateway],
    }).compile();

    gateway = module.get<NotificationGateway>(NotificationGateway);

    // @ts-expect-error: mock server manually
    gateway['server'] = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as unknown as Server;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('sendNotification()', () => {
    it('should emit notification to specific user', () => {
      const userId = '';
      const payload: INotification = {
        type: NotificationType.PROFILE_EDIT,
        message: 'New notification',
        ownerId: userId,
        isNew: false,
      };

      gateway.sendNotification(userId, payload);

      expect(gateway['server'].to).toHaveBeenCalledWith(userId);
      expect(gateway['server'].emit).toHaveBeenCalledWith(
        NotificationEvents.NOTIFICATION,
        payload,
      );
    });
  });

  describe('handleConnection()', () => {
    it('should join socket room if userId exists in query', () => {
      const socket = {
        handshake: {
          query: { userId: '123' },
        },
        join: jest.fn(),
      } as unknown as Socket;

      gateway.handleConnection(socket);

      expect(socket.join).toHaveBeenCalledWith('123');
    });

    it('should not join room if userId is missing', () => {
      const socket = {
        handshake: {
          query: {},
        },
        join: jest.fn(),
      } as unknown as Socket;

      gateway.handleConnection(socket);

      expect(socket.join).not.toHaveBeenCalled();
    });
  });
});
