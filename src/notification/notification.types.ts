import type { NotificationType } from '@/enums/notification.enums';

export interface INotification {
  id?: string;
  type: NotificationType;
  admin: string;
  profile?: string;
  ownerId: string;
  isNew: boolean;
}
