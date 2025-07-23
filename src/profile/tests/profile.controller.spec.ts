import { NotFoundException } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { Gender } from '@/enums/gender.enum';
import { FileUploadService } from '@/file-upload/file-upload.service';
import type { CreateProfileDTO } from '@/profile/dto/create-profile.dto';
import type { UpdateProfileDTO } from '@/profile/dto/update-profile.dto';
import { ProfileController } from '@/profile/profile.controller';
import { ProfileService } from '@/profile/profile.service';

const mockProfileService = {
  findAllByUserId: jest.fn(),
  findAllWithPagination: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  searchProfiles: jest.fn(),
};

const mockFileUploadService = {
  uploadImage: jest.fn(),
};

describe('ProfileController', () => {
  let controller: ProfileController;
  let profileService: jest.Mocked<ProfileService>;
  let fileUploadService: jest.Mocked<FileUploadService>;

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
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
    profileService = module.get(ProfileService);
    fileUploadService = module.get(FileUploadService);
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
      };
      profileService.findById.mockResolvedValue(existing as any);
      fileUploadService.uploadImage.mockResolvedValue('new-url');
      profileService.update.mockResolvedValue({
        ...existing,
        ...dto,
        avatarUrl: 'new-url',
      } as any);

      const result = await controller.updateProfileById('id', dto, file);

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
        controller.updateProfileById('not-found-id', {}, undefined),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUserById()', () => {
    it('should delete a profile and return success message', async () => {
      profileService.delete.mockResolvedValue(undefined);

      const result = await controller.deleteProfileById('profile-id');

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
});
