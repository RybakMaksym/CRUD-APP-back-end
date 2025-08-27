import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';

import { USER_POPULATED_DATA } from '@/constants/populated-data.constants';
import { NotificationType } from '@/enums/notification.enums';
import { escapeRegex } from '@/helpers/escape-regex';
import { NotificationGateway } from '@/notification/notification.gateway';
import { NotificationService } from '@/notification/notification.service';
import { CreateProfileDTO } from '@/profile/dto/create-profile.dto';
import { Profile, ProfileDocument } from '@/profile/models/profile.model';
import { IPopulatedProfiles, IProfile } from '@/profile/profile.types';
import { FilterableFields } from '@/types/filterable-fileds.type';
import { IPaginatedResponse } from '@/types/pagination.interfaces';
import { IStatsResponse } from '@/types/response.interfaces';
import { User, UserDocument } from '@/user/models/user.model';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name)
    private readonly profileModel: Model<ProfileDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
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

  public async delete(id: string): Promise<IProfile> {
    const profile = await this.profileModel.findById(id);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    try {
      await this.userModel.findByIdAndUpdate(profile.ownerId, {
        $pull: { profiles: profile.id },
      });

      return this.profileModel.findByIdAndDelete(id);
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

    const escaped = escapeRegex(query);
    const regex = new RegExp(escaped, 'i');

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

  public async getFilterSuggestions(
    field: FilterableFields,
    query: string,
    userId: string,
  ): Promise<string[]> {
    const regex = new RegExp(query, 'i');
    const fieldName = field.toString();

    return this.profileModel
      .find({
        ownerId: userId,
        [fieldName]: regex,
      })
      .distinct(fieldName)
      .exec() as Promise<string[]>;
  }

  public async filterByFields(
    field: FilterableFields,
    query: string,
    userId: string,
  ): Promise<IProfile[]> {
    const regex = new RegExp(query, 'i');

    return this.profileModel.find({
      ownerId: userId,
      [field.toString()]: regex,
    });
  }

  public async filterByAge(userId: string): Promise<IProfile[]> {
    const today = new Date();
    const adultDay = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDay(),
    );

    return this.profileModel.find({
      ownerId: userId,
      birthDate: { $lte: adultDay },
    });
  }

  public async getProfilesStats(): Promise<IStatsResponse> {
    const totalUsers = await this.userModel.countDocuments().exec();
    const totalProfiles = await this.profileModel.countDocuments().exec();

    const today = new Date();
    const adultDay = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDay(),
    );

    const totalAdults = await this.profileModel
      .find({
        birthDate: { $lte: adultDay },
      })
      .countDocuments()
      .exec();

    return {
      totalUsers,
      totalProfiles,
      totalAdults,
    };
  }

  public async sendProfileNotification(
    ownerId: string,
    notificationType: NotificationType,
    notificationMessage: string,
  ): Promise<void> {
    const notification = await this.notificationService.createNotification({
      type: notificationType,
      message: notificationMessage,
      ownerId: ownerId,
      isNew: true,
    });

    this.notificationGateway.sendNotification(ownerId.toString(), notification);
  }
}
