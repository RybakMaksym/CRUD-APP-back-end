import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateUserDTO } from '@/auth/dto/create-user.dto';
import { Role } from '@/enums/role.enum';
import { User } from '@/user/models/user.model';
import { UserService } from '@/user/user.service';

const mockUserModel = () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
});

describe('UserService', () => {
  let userService: UserService;
  let model: ReturnType<typeof mockUserModel>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useFactory: mockUserModel,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    model = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto: CreateUserDTO = {
        username: 'name',
        email: 'email@gmail.com',
        password: '12345678',
        isAdmin: false,
      };
      const user = {
        ...dto,
        role: Role.User,
      };

      model.create.mockResolvedValue(user);

      const result = await userService.create(dto);
      expect(model.create).toHaveBeenCalled();
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update user by id', async () => {
      const updatedUser = { email: 'updated@mail.com' };
      model.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedUser),
      });

      const result = await userService.update('user-id', {
        email: 'updated@mail.com',
      });
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-id',
        { email: 'updated@mail.com' },
        { new: true },
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw InternalServerErrorException on error', async () => {
      model.findByIdAndUpdate.mockImplementation(() => {
        throw new Error();
      });

      await expect(userService.update('id', {})).rejects.toThrow(
        'Failed to update user',
      );
    });
  });

  describe('delete', () => {
    it('should delete user if exists', async () => {
      model.findById.mockResolvedValue({ _id: 'user-id' });
      model.findByIdAndDelete.mockResolvedValue(undefined);

      await expect(userService.delete('user-id')).resolves.not.toThrow();
      expect(model.findById).toHaveBeenCalledWith('user-id');
      expect(model.findByIdAndDelete).toHaveBeenCalledWith('user-id');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      model.findById.mockResolvedValue(null);

      await expect(userService.delete('user-id')).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw InternalServerErrorException if deletion fails', async () => {
      model.findById.mockResolvedValue({ _id: 'user-id' });
      model.findByIdAndDelete.mockImplementation(() => {
        throw new Error();
      });

      await expect(userService.delete('user-id')).rejects.toThrow(
        'Failed to delete user',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const user = { email: 'email@gmail.com' };
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });

      const result = await userService.findByEmail(user.email);
      expect(result).toEqual(user);
    });
  });

  describe('findById', () => {
    it('should find user by email', async () => {
      const user = { email: 'test@mail.com' };

      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(user),
      });

      const result = await userService.findByEmail(user.email);
      expect(result).toEqual(user);
    });

    it('should return null if user not found by id', async () => {
      model.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await userService.findById('id');
      expect(result).toBeNull();
    });
  });

  describe('isEmailTaken', () => {
    it('should return true if email is taken', async () => {
      const userId = 'user-id';
      const userEmail = 'taken@mail.com';

      model.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([{ _id: 'another-id' }]),
      });

      const result = await userService.isEmailTaken(userId, userEmail);
      expect(model.find).toHaveBeenCalledWith({
        email: userEmail,
        _id: { $ne: userId },
      });
      expect(result).toBe(true);
    });

    it('should return false if email is not taken', async () => {
      const userId = 'user-id';
      const userEmail = 'taken@mail.com';

      model.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await userService.isEmailTaken(userId, userEmail);
      expect(model.find).toHaveBeenCalledWith({
        email: userEmail,
        _id: { $ne: userId },
      });
      expect(result).toBe(false);
    });
  });

  describe('searchUsers', () => {
    it('should search users by query', async () => {
      const query = 'test';
      const regex = new RegExp(query, 'i');
      const users = [{ email: 'test@mail.com' }];

      model.find.mockResolvedValue(users);

      const result = await userService.searchUsers(query);
      expect(model.find).toHaveBeenCalledWith({
        $or: [{ email: regex }, { username: regex }],
      });
      expect(result).toEqual(users);
    });
  });

  describe('getTotalUsers', () => {
    it('should get total users', async () => {
      model.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      const result = await userService.getTotalUsers();
      expect(result).toBe(5);
    });
  });

  describe('findAllWithPagination', () => {
    it('should return all users with pagination', async () => {
      const users = [{ email: '1@mail.com' }, { email: '2@mail.com' }];

      model.find.mockReturnValue({
        skip: () => ({
          limit: () => ({ exec: jest.fn().mockResolvedValue(users) }),
        }),
      });

      const result = await userService.findAllWithPagination(1, 2);
      expect(result).toEqual(users);
    });
  });
});
