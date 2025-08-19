import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { Languages } from '@/enums/languages';
import { Role } from '@/enums/role.enum';
import { FileUploadService } from '@/file-upload/file-upload.service';
import { NotificationGateway } from '@/notification/notification.gateway';
import { NotificationService } from '@/notification/notification.service';
import { UserController } from '@/user/user.controller';
import { UserService } from '@/user/user.service';

const mockUserService = () => ({
  findById: jest.fn(),
  getTotalUsers: jest.fn(),
  findAllWithPagination: jest.fn(),
  searchUsers: jest.fn(),
  update: jest.fn(),
  isEmailTaken: jest.fn(),
  delete: jest.fn(),
});

const mockFileUploadService = () => ({
  uploadImage: jest.fn(),
});

const mockNotificationService = () => ({
  createNotification: jest.fn(),
});

const mockNotificationGateway = () => ({
  sendNotification: jest.fn(),
});

describe('UserController', () => {
  let controller: UserController;
  let userService: ReturnType<typeof mockUserService>;
  let fileService: ReturnType<typeof mockFileUploadService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useFactory: mockUserService },
        { provide: FileUploadService, useFactory: mockFileUploadService },
        { provide: NotificationService, useFactory: mockNotificationService },
        { provide: NotificationGateway, useFactory: mockNotificationGateway },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
    fileService = module.get(FileUploadService);
  });

  describe('getTotalUsers()', () => {
    it('should return total users', async () => {
      const mockUser = { role: Role.Admin };
      userService.findById.mockResolvedValue(mockUser);
      userService.getTotalUsers.mockResolvedValue(5);

      const result = await controller.getTotalUsers('admin-id');

      expect(result).toEqual({ total: 5 });
    });

    it('should throw ForbiddenException for non-admin', async () => {
      userService.findById.mockResolvedValue({ role: Role.User });

      await expect(controller.getTotalUsers('user-id')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAllUsers()', () => {
    it('should return users with pagination', async () => {
      const users = [{ email: 'test@mail.com' }];
      userService.findById.mockResolvedValue({ role: Role.Admin });
      userService.findAllWithPagination.mockResolvedValue(users);

      const result = await controller.findAllUsers('admin-id', 1, 10);

      expect(result).toEqual(users);
    });

    it('should throw ForbiddenException if not admin', async () => {
      userService.findById.mockResolvedValue({ role: Role.User });

      await expect(controller.findAllUsers('user-id')).rejects.toThrow(
        'You do not have access to this resource',
      );
    });
  });

  describe('searchUsers()', () => {
    it('should return filtered users', async () => {
      const users = [{ username: 'admin' }];
      userService.findById.mockResolvedValue({ role: Role.Admin });
      userService.searchUsers.mockResolvedValue(users);

      const result = await controller.searchUsers('admin-id', 'adm');

      expect(result).toEqual(users);
    });

    it('should throw ForbiddenException if not admin', async () => {
      userService.findById.mockResolvedValue({ role: Role.User });

      await expect(controller.searchUsers('user-id', 'adm')).rejects.toThrow(
        'You do not have access to this resource',
      );
    });
  });

  describe('findMeById()', () => {
    it('should return current user', async () => {
      const user = { email: 'me@mail.com' };
      userService.findById.mockResolvedValue(user);

      const result = await controller.findMeById('me-id');

      expect(result).toEqual(user);
    });
  });

  describe('findUserById()', () => {
    it('should return user if admin', async () => {
      const user = { username: 'admin' };
      userService.findById.mockResolvedValueOnce({ role: Role.Admin });
      userService.findById.mockResolvedValueOnce(user);

      const result = await controller.findUserById('admin-id', 'target-id');

      expect(result).toEqual(user);
    });

    it('should throw ForbiddenException if not admin', async () => {
      userService.findById.mockResolvedValue({ role: Role.User });

      await expect(
        controller.findUserById('user-id', 'target-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateUserById()', () => {
    it('should update user with avatar', async () => {
      const adminId = '64a123456789abcdef123456';
      const userId = '64a987654321fedcba654321';
      const dto = { email: 'new@mail.com', isAdmin: true };
      const file = {
        buffer: Buffer.from(''),
        originalname: 'file.png',
      } as Express.Multer.File;
      userService.findById.mockResolvedValueOnce({ role: Role.Admin });
      userService.findById.mockResolvedValueOnce({
        role: Role.User,
        username: 'old',
        email: 'old@mail.com',
      });
      userService.isEmailTaken.mockResolvedValue(false);
      fileService.uploadImage.mockResolvedValue('http://img.com/file.png');
      userService.update.mockResolvedValue({ email: 'new@mail.com' });

      const result = await controller.updateUserById(
        adminId,
        userId,
        dto,
        file,
      );

      expect(result).toEqual({ email: 'new@mail.com' });
    });

    it('should update user without passing isAdmin', async () => {
      const dto = { email: 'new@mail.com' };
      userService.findById.mockResolvedValueOnce({ role: Role.Admin });
      userService.findById.mockResolvedValueOnce({
        role: Role.User,
        username: 'old',
        email: 'old@mail.com',
      });
      userService.isEmailTaken.mockResolvedValue(false);
      userService.update.mockResolvedValue({ email: 'new@mail.com' });

      const result = await controller.updateUserById(
        'admin-id',
        'user-id',
        dto,
      );

      expect(result).toEqual({ email: 'new@mail.com' });
    });

    it('should throw NotFoundException if user not exists', async () => {
      userService.findById.mockResolvedValueOnce({ role: Role.Admin });
      userService.findById.mockResolvedValueOnce(null);

      await expect(
        controller.updateUserById('admin', 'not-exist', {}),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if email taken', async () => {
      userService.findById.mockResolvedValueOnce({ role: Role.Admin });
      userService.findById.mockResolvedValueOnce({ username: 'user' });
      userService.isEmailTaken.mockResolvedValue(true);

      await expect(
        controller.updateUserById('admin', 'user-id', {
          email: 'taken@mail.com',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if not admin', async () => {
      userService.findById.mockResolvedValue({ role: Role.User });

      await expect(
        controller.updateUserById('user', 'other-id', {}),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateUserSettings()', () => {
    it('should update user language successfully', async () => {
      const userId = 'user-id';
      const dto = { language: Languages.UKRAINIAN };
      const existingUser = { language: Languages.ENGLISH };
      userService.findById.mockResolvedValue(existingUser);
      userService.update.mockResolvedValue({
        ...existingUser,
        language: Languages.UKRAINIAN,
      });

      const result = await controller.updateUserSettings(userId, dto);

      expect(userService.findById).toHaveBeenCalledWith(userId);
      expect(userService.update).toHaveBeenCalledWith(userId, {
        language: 'uk',
      });
      expect(result).toEqual({
        message: "User's settings updated successfuly",
      });
    });

    it('should keep existing language if dto.language is not provided', async () => {
      const userId = 'user-id';
      const dto = {};
      const existingUser = { language: Languages.ENGLISH };
      userService.findById.mockResolvedValue(existingUser);
      userService.update.mockResolvedValue(existingUser);

      const result = await controller.updateUserSettings(userId, dto);

      expect(userService.findById).toHaveBeenCalledWith(userId);
      expect(userService.update).toHaveBeenCalledWith(userId, {
        language: 'en',
      });
      expect(result).toEqual({
        message: "User's settings updated successfuly",
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const userId = 'user-id';
      const dto = { language: Languages.UKRAINIAN };

      userService.findById.mockResolvedValue(null);

      await expect(controller.updateUserSettings(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteUserById()', () => {
    it('should delete user if admin', async () => {
      userService.findById.mockResolvedValue({ role: Role.Admin });
      userService.delete.mockResolvedValue(undefined);

      const result = await controller.deleteUserById('admin-id', 'target-id');

      expect(result).toEqual({ message: 'User deleted successfuly' });
    });

    it('should throw ForbiddenException if not admin', async () => {
      userService.findById.mockResolvedValue({ role: Role.User });

      await expect(
        controller.deleteUserById('user-id', 'target-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
