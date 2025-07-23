import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';

import { USER_POPULATED_DATA } from '@/constants/populated-data.constants';
import { CreateProfileDTO } from '@/profile/dto/create-profile.dto';
import { Profile, ProfileDocument } from '@/profile/models/profile.model';
import { IPopulatedProfiles, IProfile } from '@/profile/types/profile';
import { IPaginatedResponse } from '@/types/pagination.interfaces';
import { User, UserDocument } from '@/user/models/user.model';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  public async create(
    userId: string,
    dto: CreateProfileDTO,
  ): Promise<IProfile> {
    const profile = await this.profileModel.create({
      ...dto,
      ownerId: userId,
    });
    await this.userModel.findByIdAndUpdate(userId, {
      $push: { profiles: profile.id },
    });

    return profile;
  }

  public async update(
    id: string,
    update: UpdateQuery<ProfileDocument>,
  ): Promise<IProfile> {
    try {
      return this.profileModel
        .findByIdAndUpdate(id, update, { new: true })
        .exec();
    } catch {
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  public async delete(id: string): Promise<void> {
    const profile = await this.profileModel.findById(id);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    try {
      await this.profileModel.findByIdAndDelete(id);
      await this.userModel.findByIdAndUpdate(profile.ownerId, {
        $pull: { profiles: profile.id },
      });
    } catch {
      throw new InternalServerErrorException('Failed to delete profile');
    }
  }

  public async findById(id: string): Promise<IProfile> {
    return this.profileModel.findById(id).exec();
  }

  public async findAllByUserId(userId: string): Promise<IProfile[]> {
    const user = await this.userModel
      .findById(userId)
      .populate<IPopulatedProfiles>(USER_POPULATED_DATA.profilesBasic)
      .exec();

    return user.profiles;
  }

  public async searchProfiles(
    query: string,
    userId: string,
  ): Promise<IProfile[]> {
    if (!query) return this.findAllByUserId(userId);

    const regex = new RegExp(query, 'i');

    return this.profileModel.find({
      ownerId: userId,
      $or: [
        { name: regex },
        { gender: regex },
        { country: regex },
        { city: regex },
      ],
    });
  }

  public async findAllWithPagination(
    ownerId: string,
    page: number,
    limit: number,
  ): Promise<IPaginatedResponse<IProfile>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.profileModel.find({ ownerId }).skip(skip).limit(limit).exec(),
      this.profileModel.countDocuments({ ownerId }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const nextPage = page < totalPages ? page + 1 : null;

    return {
      data,
      page,
      limit,
      total,
      nextPage,
    };
  }
}
