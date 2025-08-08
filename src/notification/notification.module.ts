import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Notification,
  NotificationSchema,
} from '@/notification/models/notification.model';
import { NotificationController } from '@/notification/notification.controller';
import { NotificationGateway } from '@/notification/notification.gateway';
import { NotificationService } from '@/notification/notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
