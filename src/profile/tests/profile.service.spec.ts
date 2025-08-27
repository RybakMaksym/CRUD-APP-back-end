import { getModelToken } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { type Model } from 'mongoose';

import { Gender } from '@/enums/gender.enum';
import { NotificationType } from '@/enums/notification.enums';
import { NotificationGateway } from '@/notification/notification.gateway';
import { NotificationService } from '@/notification/notification.service';
import type { CreateProfileDTO } from '@/profile/dto/create-profile.dto';
import { Profile } from '@/profile/models/profile.model';
import { ProfileService } from '@/profile/profile.service';
import { User } from '@/user/models/user.model';

const mockProfileModel = {
  create: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
};

const mockUserModel = {
  findByIdAndUpdate: jest.fn(),
  findById: jest.fn(),
  countDocuments: jest.fn(),
};

const mockNotificationService = () => ({
  createNotification: jest.fn(),
});

const mockNotificationGateway = () => ({
  sendNotification: jest.fn(),
});

describe('ProfileService', () => {
  let service: ProfileService;
  let profileModel: jest.Mocked<Model<any>>;
  let userModel: jest.Mocked<Model<any>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getModelToken(Profile.name),
          useValue: mockProfileModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        { provide: NotificationService, useFactory: mockNotificationService },
        { provide: NotificationGateway, useFactory: mockNotificationGateway },
      ],
    }).compile();

    service = module.get(ProfileService);
    profileModel = module.get(getModelToken(Profile.name));
    userModel = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should create profile and add to user', async () => {
      const dto: CreateProfileDTO = {
        name: 'John Doe',
        gender: Gender.Male,
        birthDate: new Date('1990-01-01'),
        country: 'USA',
        city: 'New York',
      };
      const profile = { id: 'profile-id', ...dto, ownerId: 'user-id' };
      (profileModel.create as jest.Mock).mockResolvedValue(profile);

      const result = await service.create('user-id', dto);

      expect(profileModel.create).toHaveBeenCalledWith({
        ...dto,
        ownerId: 'user-id',
      });
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith('user-id', {
        $push: { profiles: 'profile-id' },
      });
      expect(result).toEqual(profile);
    });
  });

  describe('update()', () => {
    it('should update and return the profile', async () => {
      const updatedProfile = { name: 'Updated' };
      const exec = jest.fn().mockResolvedValue(updatedProfile);
      (profileModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ exec });

      const result = await service.update('profile-id', updatedProfile);

      expect(profileModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'profile-id',
        updatedProfile,
        { new: true },
      );
      expect(result).toEqual(updatedProfile);
    });

    it('should throw InternalServerErrorException on error', async () => {
      (profileModel.findByIdAndUpdate as jest.Mock).mockImplementation(() => {
        throw new Error();
      });

      await expect(service.update('profile-id', {})).rejects.toThrow(
        'Failed to update profile',
      );
    });
  });

  describe('delete()', () => {
    it('should delete the profile if it exists', async () => {
      (profileModel.findById as jest.Mock).mockResolvedValue({ _id: 'id' });
      (profileModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await expect(service.delete('profile-id')).resolves.not.toThrow();

      expect(profileModel.findById).toHaveBeenCalledWith('profile-id');
      expect(profileModel.findByIdAndDelete).toHaveBeenCalledWith('profile-id');
    });

    it('should throw NotFoundException if profile does not exist', async () => {
      (profileModel.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.delete('profile-id')).rejects.toThrow(
        'Profile not found',
      );
    });

    it('should throw InternalServerErrorException on deletion failure', async () => {
      (profileModel.findById as jest.Mock).mockResolvedValue({ _id: 'id' });
      (profileModel.findByIdAndDelete as jest.Mock).mockImplementation(() => {
        throw new Error();
      });

      await expect(service.delete('profile-id')).rejects.toThrow(
        'Failed to delete profile',
      );
    });
  });

  describe('findById()', () => {
    it('should return a profile by id', async () => {
      const profile = { id: 'id', name: 'Test' };
      const exec = jest.fn().mockResolvedValue(profile);
      (profileModel.findById as jest.Mock).mockReturnValue({ exec });

      const result = await service.findById('id');

      expect(profileModel.findById).toHaveBeenCalledWith('id');
      expect(result).toEqual(profile);
    });
  });

  describe('findAllByUserId()', () => {
    it('should return all profiles of a user', async () => {
      const profiles = [{ name: 'One' }, { name: 'Two' }];
      const exec = jest.fn().mockResolvedValue({ profiles });
      (userModel.findById as jest.Mock).mockReturnValue({
        populate: () => ({ exec }),
      });

      const result = await service.findAllByUserId('user-id');

      expect(userModel.findById).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(profiles);
    });
  });

  describe('searchProfiles()', () => {
    it('should return all profiles of a user if query is empty', async () => {
      const mockProfiles = [{ name: 'Anna' }];
      const spy = jest
        .spyOn(service, 'findAllByUserId')
        .mockResolvedValue(mockProfiles as any);

      const result = await service.searchProfiles('', 'user-id');

      expect(spy).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockProfiles);
    });

    it('should return filtered profiles if query is provided', async () => {
      const mockProfiles = [{ name: 'John' }, { name: 'Johnny' }];
      (profileModel.find as jest.Mock).mockResolvedValue(mockProfiles);

      const result = await service.searchProfiles('john', 'user-id');

      expect(profileModel.find).toHaveBeenCalledWith({
        ownerId: 'user-id',
        $or: [
          { name: expect.any(RegExp) },
          { gender: expect.any(RegExp) },
          { country: expect.any(RegExp) },
          { city: expect.any(RegExp) },
        ],
      });
      const regexArg = (profileModel.find as jest.Mock).mock.calls[0][0].$or[0]
        .name;
      expect(regexArg).toBeInstanceOf(RegExp);
      expect(regexArg.source).toBe('john');
      expect(regexArg.flags).toContain('i');

      expect(result).toEqual(mockProfiles);
    });
  });

  describe('findAllWithPagination()', () => {
    it('should return paginated profiles for given user', async () => {
      const fakeProfiles = [
        { name: 'Test Profile 1' },
        { name: 'Test Profile 2' },
      ];
      const total = 25;
      const execMock = jest.fn().mockResolvedValue(fakeProfiles);
      const limitMock = jest.fn().mockReturnValue({ exec: execMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const findMock = jest.fn().mockReturnValue({ skip: skipMock });
      const countMock = jest.fn().mockResolvedValue(total);
      profileModel.find = findMock as any;
      profileModel.countDocuments = countMock as any;

      const result = await service.findAllWithPagination('user-id', 2, 10);

      expect(findMock).toHaveBeenCalledWith({ ownerId: 'user-id' });
      expect(skipMock).toHaveBeenCalledWith(10);
      expect(limitMock).toHaveBeenCalledWith(10);
      expect(countMock).toHaveBeenCalledWith({ ownerId: 'user-id' });
      expect(result).toEqual({
        data: fakeProfiles,
        page: 2,
        limit: 10,
        total,
        nextPage: 3,
      });
    });

    it('should return nextPage as null if on last page', async () => {
      const fakeProfiles = [{ name: 'Last Page' }];
      const total = 11;
      const execMock = jest.fn().mockResolvedValue(fakeProfiles);
      const limitMock = jest.fn().mockReturnValue({ exec: execMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const findMock = jest.fn().mockReturnValue({ skip: skipMock });
      const countMock = jest.fn().mockResolvedValue(total);
      profileModel.find = findMock as any;
      profileModel.countDocuments = countMock as any;

      const result = await service.findAllWithPagination('user-id', 2, 10);

      expect(result).toEqual({
        data: fakeProfiles,
        page: 2,
        limit: 10,
        total,
        nextPage: null,
      });
    });

    it('should calculate correct skip value for different page and limit', async () => {
      const execMock = jest.fn().mockResolvedValue([]);
      const limitMock = jest.fn().mockReturnValue({ exec: execMock });
      const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
      const findMock = jest.fn().mockReturnValue({ skip: skipMock });
      const countMock = jest.fn().mockResolvedValue(0);
      profileModel.find = findMock as any;
      profileModel.countDocuments = countMock as any;

      await service.findAllWithPagination('user-id', 3, 5);

      expect(skipMock).toHaveBeenCalledWith(10);
      expect(limitMock).toHaveBeenCalledWith(5);
    });
  });

  describe('getFilterSuggestions()', () => {
    it('should return distinct values for a field matching the query', async () => {
      const mockSuggestions = ['Kyiv', 'Kharkiv'];
      (profileModel.find as jest.Mock).mockReturnValue({
        distinct: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockSuggestions),
        }),
      });

      const result = await service.getFilterSuggestions('city', 'k', 'user-id');

      expect(profileModel.find).toHaveBeenCalledWith({
        ownerId: 'user-id',
        city: expect.any(RegExp),
      });
      expect(result).toEqual(mockSuggestions);
    });
  });

  describe('filterByFields()', () => {
    it('should return profiles filtered by field and query', async () => {
      const mockProfiles = [{ city: 'Kyiv' }, { city: 'Kharkiv' }];
      (profileModel.find as jest.Mock).mockResolvedValue(mockProfiles);

      const result = await service.filterByFields('city', 'k', 'user-id');

      expect(profileModel.find).toHaveBeenCalledWith({
        ownerId: 'user-id',
        city: expect.any(RegExp),
      });
      expect(result).toEqual(mockProfiles);
    });
  });

  describe('filterByAge()', () => {
    it('should return profiles where birthDate is at least 18 years ago', async () => {
      const mockProfiles = [{ birthDate: new Date('2000-01-01') }];
      (profileModel.find as jest.Mock).mockResolvedValue(mockProfiles);

      const result = await service.filterByAge('user-id');

      const expectedDate = new Date();
      expectedDate.setFullYear(expectedDate.getFullYear() - 18);
      expectedDate.setDate(expectedDate.getDate());
      expect(profileModel.find).toHaveBeenCalledWith({
        ownerId: 'user-id',
        birthDate: { $lte: expect.any(Date) },
      });
      const actualQuery = (profileModel.find as jest.Mock).mock.calls[0][0];
      expect(actualQuery.birthDate.$lte.getFullYear()).toBeLessThanOrEqual(
        expectedDate.getFullYear(),
      );
      expect(result).toEqual(mockProfiles);
    });
  });

  describe('getProfilesStats()', () => {
    it('should return totalUsers, totalProfiles and totalAdults', async () => {
      const mockTotalUsers = 100;
      const mockTotalProfiles = 80;
      const mockTotalAdults = 60;
      const execTotalUsers = jest.fn().mockResolvedValue(mockTotalUsers);
      const execTotalProfiles = jest.fn().mockResolvedValue(mockTotalProfiles);
      const execTotalAdults = jest.fn().mockResolvedValue(mockTotalAdults);
      const findAdultsMock = jest.fn().mockReturnValue({
        countDocuments: jest.fn().mockReturnValue({
          exec: execTotalAdults,
        }),
      });
      (userModel.countDocuments as jest.Mock).mockReturnValue({
        exec: execTotalUsers,
      });
      (profileModel.countDocuments as jest.Mock).mockReturnValue({
        exec: execTotalProfiles,
      });
      (profileModel.find as jest.Mock).mockImplementation(findAdultsMock);

      const result = await service.getProfilesStats();

      expect(userModel.countDocuments).toHaveBeenCalled();
      expect(profileModel.countDocuments).toHaveBeenCalled();
      expect(profileModel.find).toHaveBeenCalledWith({
        birthDate: { $lte: expect.any(Date) },
      });
      expect(result).toEqual({
        totalUsers: mockTotalUsers,
        totalProfiles: mockTotalProfiles,
        totalAdults: mockTotalAdults,
      });
    });
  });

  describe('sendProfileNotification()', () => {
    it('should create notification and send it via gateway', async () => {
      const ownerId = '';
      const type = NotificationType.PROFILE_EDIT;
      const message = 'Your profile was updated';
      const mockNotification = {
        id: 'notif-id',
        type,
        message,
        ownerId,
        createdAt: new Date(),
        isNew: true,
      };
      const createNotification = jest
        .spyOn(service['notificationService'], 'createNotification')
        .mockResolvedValue(mockNotification as any);
      const sendNotification = jest.spyOn(
        service['notificationGateway'],
        'sendNotification',
      );

      await service.sendProfileNotification(ownerId, type, message);

      expect(createNotification).toHaveBeenCalledWith({
        type,
        message,
        ownerId,
        isNew: true,
      });
      expect(sendNotification).toHaveBeenCalledWith(ownerId, mockNotification);
    });
  });
});
