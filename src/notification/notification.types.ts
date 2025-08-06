import type { Types } from 'mongoose';

import type { NotificationType } from '@/enums/notification.enums';

export interface INotification {
  id?: string;
  type: NotificationType;
  message: string;
  ownerId: Types.ObjectId;
}
