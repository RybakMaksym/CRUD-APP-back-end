import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Gender } from '@/enums/gender.enum';
import { FileUploadService } from '@/file-upload/file-upload.service';
import { CreateProfileDTO } from '@/profile/dto/create-profile.dto';
import { UpdateProfileDTO } from '@/profile/dto/update-profile.dto';
import { ProfileController } from '@/profile/profile.controller';
import { ProfileService } from '@/profile/profile.service';

const mockProfileService = {
  findAllByUserId: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
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
    it('should return all profiles of user', async () => {
      const profiles = [{ name: 'Profile1' }];
      profileService.findAllByUserId.mockResolvedValue(profiles as any);

      const result = await controller.getMyProfiles('user-id');
      expect(profileService.findAllByUserId).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(profiles);
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
      profileService.create.mockResolvedValue(dto);

      const result = await controller.create('user-id', dto, undefined);

      expect(fileUploadService.uploadImage).not.toHaveBeenCalled();
      expect(result).toEqual(dto);
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
});
