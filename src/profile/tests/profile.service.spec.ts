import { getModelToken } from '@nestjs/mongoose';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { Model } from 'mongoose';

import { Gender } from '@/enums/gender.enum';
import type { CreateProfileDTO } from '@/profile/dto/create-profile.dto';
import { Profile } from '@/profile/models/profile.model';
import { ProfileService } from '@/profile/profile.service';
import { User } from '@/user/models/user.model';

const mockProfileModel = {
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

const mockUserModel = {
  findByIdAndUpdate: jest.fn(),
  findById: jest.fn(),
};

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
      const profile = { id: 'profile-id', ...dto };
      (profileModel.create as jest.Mock).mockResolvedValue(profile);

      const result = await service.create('user-id', dto);

      expect(profileModel.create).toHaveBeenCalledWith(dto);
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
});
