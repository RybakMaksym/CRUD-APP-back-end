import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { NotificationType } from '@/enums/notification.enums';
import { INotification } from '@/notification/notification.types';

export type NotificationDocument = Notification & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, returnedObject) => {
      returnedObject.id = returnedObject._id?.toString();
      delete returnedObject._id;
      delete returnedObject.__v;
      delete returnedObject.updatedAt;

      return returnedObject;
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
