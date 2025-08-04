import type { Types } from 'mongoose';

import type { NotificationType } from '@/enums/notification.enums';

export interface INotification {
  type: NotificationType;
  message: string;
  ownerId: Types.ObjectId;
}
