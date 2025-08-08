import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Notification,
  NotificationDocument,
} from '@/notification/models/notification.model';
import { INotification } from '@/notification/notification.types';
import { IPaginatedResponse } from '@/types/pagination.interfaces';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  public async createNotification(dto: INotification): Promise<INotification> {
    return this.notificationModel.create(dto);
  }

  public async getUserNotificationsWithPagination(
    userId: string,
    page: number,
    limit: number,
  ): Promise<IPaginatedResponse<INotification>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.notificationModel
        .find({ ownerId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({ ownerId: userId }),
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
