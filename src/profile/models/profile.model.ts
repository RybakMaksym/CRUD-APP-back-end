import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Gender } from '@/enums/gender.enum';
import { IProfile } from '@/profile/types/profile';

export type ProfileDocument = Profile & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;

      return ret;
    },
  },
})
export class Profile extends Document implements IProfile {
  @Prop({ required: true })
  public name: string;

  @Prop({ enum: Gender, required: true })
  public gender: Gender;

  @Prop({ type: Date, required: true })
  public birthDate: Date;

  @Prop({ required: true })
  public country: string;

  @Prop({ required: true })
  public city: string;

  @Prop()
  public avatarUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  public ownerId: Types.ObjectId;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
