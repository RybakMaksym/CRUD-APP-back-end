import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Notification,
  NotificationDocument,
} from '@/notification/models/notification.model';
import { NotificationGetaway } from '@/notification/notification.getaway';
import { INotification } from '@/notification/types/notification';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly getaway: NotificationGetaway,
  ) {}

  public async sendNotification(dto: INotification): Promise<void> {
    const notification = await this.notificationModel.create(dto);

    this.getaway.sendNotification(
      notification.ownerId.toString(),
      notification,
    );
  }

  public async getUserNotifications(userId: string): Promise<INotification[]> {
    return this.notificationModel
      .find({ ownerId: userId })
      .sort({ createdAt: -1 })
      .lean();
  }
}
