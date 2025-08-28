import type { NotificationType } from '@/enums/notification.enums';

export interface INotification {
  id?: string;
  type: NotificationType;
  message: string;
  ownerId: string;
  isNew: boolean;
}
