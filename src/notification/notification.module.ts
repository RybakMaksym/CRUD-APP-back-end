import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Notification,
  NotificationSchema,
} from '@/notification/models/notification.model';
import { NotificationController } from '@/notification/notification.controller';
import { NotificationGetaway } from '@/notification/notification.getaway';
import { NotificationService } from '@/notification/notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGetaway],
  exports: [NotificationService],
})
export class NotificationModule {}
