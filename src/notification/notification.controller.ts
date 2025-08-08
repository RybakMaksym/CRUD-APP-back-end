import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from '@/auth/guards/access-token.guard';
import { DEFAULT_NOTIFICATIONS_PAGE_LIMIT } from '@/constants/notification.constants';
import { GetUserId } from '@/decorators/get-user-id.decorator';
import { NotificationService } from '@/notification/notification.service';
import { INotification } from '@/notification/notification.types';
import { IPaginatedResponse } from '@/types/pagination.interfaces';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(AccessTokenGuard)
  public async getNotifications(
    @GetUserId() userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = DEFAULT_NOTIFICATIONS_PAGE_LIMIT,
  ): Promise<IPaginatedResponse<INotification>> {
    return this.notificationService.getUserNotificationsWithPagination(
      userId,
      +page,
      +limit,
    );
  }
}
