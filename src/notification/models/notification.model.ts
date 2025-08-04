import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { NotificationType } from '@/enums/notification.enums';
import { INotification } from '@/notification/types/notification';

export type NotificationDocument = Notification & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.updatedAt;

      return ret;
    },
  },
})
export class Notification extends Document implements INotification {
  @Prop({ enum: NotificationType, required: true })
  public type: NotificationType;

  @Prop({ required: true })
  public message: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  public ownerId: Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
