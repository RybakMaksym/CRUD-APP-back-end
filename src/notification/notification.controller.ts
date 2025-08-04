import { Controller, Get, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from '@/auth/guards/access-token.guard';
import { GetUserId } from '@/decorators/get-user-id.decorator';
import { NotificationService } from '@/notification/notification.service';
import { INotification } from '@/notification/types/notification';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  public async getNotifications(
    @GetUserId() userId: string,
  ): Promise<INotification[]> {
    return this.notificationService.getUserNotifications(userId);
  }
}
