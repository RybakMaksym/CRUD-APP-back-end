import { NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { FilterFields } from '@/enums/filter.enums';
import { Gender } from '@/enums/gender.enum';
import { Languages } from '@/enums/languages';
import { Role } from '@/enums/role.enum';
import { FileUploadService } from '@/file-upload/file-upload.service';
import type { CreateProfileDTO } from '@/profile/dto/create-profile.dto';
import type { UpdateProfileDTO } from '@/profile/dto/update-profile.dto';
import { ProfileController } from '@/profile/profile.controller';
import { ProfileService } from '@/profile/profile.service';
import { UserService } from '@/user/user.service';

const mockProfileService = {
  findAllWithPagination: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  searchProfiles: jest.fn(),
  getFilterSuggestions: jest.fn(),
  filterByFields: jest.fn(),
  filterByAge: jest.fn(),
  getProfilesStats: jest.fn(),
  sendProfileNotification: jest.fn(),
};

const mockFileUploadService = {
  uploadImage: jest.fn(),
};

const mockUserService = () => ({
  findById: jest.fn(),
});

describe('ProfileController', () => {
  let controller: ProfileController;
  let profileService: jest.Mocked<ProfileService>;
  let fileUploadService: jest.Mocked<FileUploadService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
        {
          provide: FileUploadService,
          useValue: mockFileUploadService,
        },
        { provide: UserService, useFactory: mockUserService },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
    profileService = module.get(ProfileService);
    fileUploadService = module.get(FileUploadService);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyProfiles()', () => {
    it('should return paginated profiles of user', async () => {
      const paginatedResponse = {
        data: [
          {
            id: 'profile-id',
            name: 'Profile1',
            gender: Gender.Male,
            birthDate: new Date(),
            country: 'Ukraine',
            city: 'Kyiv',
            ownerId: 'user-id',
          },
        ],
        page: 1,
        limit: 8,
        total: 1,
        nextPage: null,
      };
      profileService.findAllWithPagination.mockResolvedValue(
        paginatedResponse as any,
      );

      const result = await controller.getMyProfiles('user-id', 1, 8);

      expect(profileService.findAllWithPagination).toHaveBeenCalledWith(
        'user-id',
        1,
        8,
      );
      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('getProfilesByUserId()', () => {
    it('should return paginated profiles by userId', async () => {
      const userId = 'user-id';
      const page = 2;
      const limit = 5;
      const paginatedProfiles = {
        data: [
          { _id: 'profile1', name: 'John', ownerId: userId },
          { _id: 'profile2', name: 'Jane', ownerId: userId },
        ],
        page,
        limit,
        total: 10,
        nextPage: 3,
      };
      profileService.findAllWithPagination.mockResolvedValue(
        paginatedProfiles as any,
      );

      const result = await controller.getProfilesByUserId(userId, page, limit);

      expect(profileService.findAllWithPagination).toHaveBeenCalledWith(
        userId,
        page,
        limit,
      );
      expect(result).toEqual(paginatedProfiles);
    });

    it('should return empty data if no profiles found', async () => {
      const userId = 'user-id';
      const page = 1;
      const limit = 10;
      const emptyPaginated = {
        data: [],
        page,
        limit,
        total: 0,
        nextPage: null,
      };
      profileService.findAllWithPagination.mockResolvedValue(
        emptyPaginated as any,
      );

      const result = await controller.getProfilesByUserId(userId, page, limit);

      expect(profileService.findAllWithPagination).toHaveBeenCalledWith(
        userId,
        page,
        limit,
      );
      expect(result).toEqual(emptyPaginated);
    });
  });

  describe('create()', () => {
    it('should create a profile with avatar', async () => {
      const dto: CreateProfileDTO = {
        name: 'Test',
        gender: Gender.Male,
        birthDate: new Date(),
        country: 'Ukraine',
        city: 'Kyiv',
      };
      const file = {
        buffer: Buffer.from('file'),
        mimetype: 'image/png',
      } as Express.Multer.File;
      fileUploadService.uploadImage.mockResolvedValue('image-url');
      profileService.create.mockResolvedValue({
        ...dto,
        avatarUrl: 'image-url',
      } as any);

      const result = await controller.create('user-id', dto, file);

      expect(fileUploadService.uploadImage).toHaveBeenCalledWith(file);
      expect(profileService.create).toHaveBeenCalledWith('user-id', {
        ...dto,
        avatarUrl: 'image-url',
      });
      expect(result).toEqual({ ...dto, avatarUrl: 'image-url' });
    });

    it('should create a profile without avatar', async () => {
      const dto: CreateProfileDTO = {
        name: 'Test',
        gender: Gender.Male,
        birthDate: new Date(),
        country: 'Ukraine',
        city: 'Kyiv',
      };
      profileService.create.mockResolvedValue({
        ...dto,
        ownerId: 'user-id',
      } as any);

      const result = await controller.create('user-id', dto, undefined);

      expect(fileUploadService.uploadImage).not.toHaveBeenCalled();
      expect(result).toMatchObject({ ...dto, ownerId: 'user-id' });
    });
  });

  describe('updateProfileById()', () => {
    it('should update a profile with avatar', async () => {
      const dto: UpdateProfileDTO = {
        name: 'Updated',
        country: 'Poland',
      };
      const file = {
        buffer: Buffer.from('file'),
        mimetype: 'image/png',
      } as Express.Multer.File;
      const existing = {
        _id: 'id',
        name: 'Old',
        gender: 'male',
        birthDate: new Date(),
        country: 'Ukraine',
        city: 'Kyiv',
        avatarUrl: 'old-url',
        ownerId: 'owner-id',
      };
      profileService.findById.mockResolvedValue(existing as any);
      fileUploadService.uploadImage.mockResolvedValue('new-url');
      profileService.update.mockResolvedValue({
        ...existing,
        ...dto,
        avatarUrl: 'new-url',
      } as any);
      userService.findById.mockResolvedValue({
        id: 'id',
        username: 'user',
        email: 'email@gmail.com',
        passwordHash: '123',
        role: Role.User,
        language: Languages.ENGLISH,
        profiles: [],
      });

      const result = await controller.updateProfileById(
        'my-id',
        'id',
        dto,
        file,
      );

      expect(result).toEqual(
        expect.objectContaining({
          name: 'Updated',
          country: 'Poland',
          avatarUrl: 'new-url',
        }),
      );
    });

    it('should throw NotFoundException if profile not found', async () => {
      profileService.findById.mockResolvedValue(null);

      await expect(
        controller.updateProfileById('user-id', 'not-found-id', {}, undefined),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUserById()', () => {
    it('should delete a profile and return success message', async () => {
      profileService.delete.mockResolvedValue({
        id: 'id',
        name: 'Old',
        gender: Gender.Male,
        birthDate: new Date(),
        country: 'Ukraine',
        city: 'Kyiv',
        ownerId: '1',
      });
      userService.findById.mockResolvedValue({
        id: 'id',
        username: 'user',
        email: 'email@gmail.com',
        passwordHash: '123',
        role: Role.User,
        language: Languages.ENGLISH,
        profiles: [],
      });

      const result = await controller.deleteProfileById(
        'user-id',
        'profile-id',
      );

      expect(profileService.delete).toHaveBeenCalledWith('profile-id');
      expect(result).toEqual({ message: 'Profile deleted successfuly' });
    });
  });

  describe('searchProfiles()', () => {
    it('should return profiles by query', async () => {
      const query = 'Anna';
      const myId = 'user-id';
      const expected = [{ name: 'Anna', ownerId: myId }];
      profileService.searchProfiles.mockResolvedValue(expected as any);

      const result = await controller.searchProfiles(myId, query);

      expect(profileService.searchProfiles).toHaveBeenCalledWith(query, myId);
      expect(result).toEqual(expected);
    });

    it('should return all profiles if query is empty', async () => {
      const query = '';
      const myId = 'user-id';
      const expected = [{ name: 'Anna', ownerId: myId }];
      profileService.searchProfiles.mockResolvedValue(expected as any);

      const result = await controller.searchProfiles(myId, query);

      expect(profileService.searchProfiles).toHaveBeenCalledWith('', myId);
      expect(result).toEqual(expected);
    });
  });

  describe('getFilterSuggestions()', () => {
    it('should call service with correct params and return suggestions', async () => {
      const suggestions = ['Kyiv', 'Kharkiv'];
      mockProfileService.getFilterSuggestions.mockResolvedValue(suggestions);

      const result = await controller.getFilterSuggestions(
        'user-id',
        'city',
        'k',
      );

      expect(profileService.getFilterSuggestions).toHaveBeenCalledWith(
        'city',
        'k',
        'user-id',
      );
      expect(result).toEqual(suggestions);
    });
  });

  describe('filterProfiles()', () => {
    it('should call filterByAge if field is "age"', async () => {
      const profiles = [{ name: 'Adult' }];
      mockProfileService.filterByAge.mockResolvedValue(profiles);

      const result = await controller.filterProfiles(
        'user-id',
        FilterFields.AGE,
        '',
      );

      expect(profileService.filterByAge).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(profiles);
    });

    it('should call filterByFields if field is "city" or "country"', async () => {
      const profiles = [{ name: 'Kyiv' }];
      mockProfileService.filterByFields.mockResolvedValue(profiles);

      const result = await controller.filterProfiles(
        'user-id',
        FilterFields.CITY,
        'k',
      );

      expect(profileService.filterByFields).toHaveBeenCalledWith(
        'city',
        'k',
        'user-id',
      );
      expect(result).toEqual(profiles);
    });
  });

  describe('getProfilesStats()', () => {
    it('should return stats from the service', async () => {
      const mockStats = {
        totalUsers: 10,
        totalProfiles: 8,
        totalAdults: 5,
      };
      mockProfileService.getProfilesStats.mockResolvedValue(mockStats);

      const result = await controller.getProfilesStats();

      expect(profileService.getProfilesStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });
});
