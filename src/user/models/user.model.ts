import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Languages } from '@/enums/languages';
import { Role } from '@/enums/role.enum';
import { Profile } from '@/profile/models/profile.model';
import { IUser } from '@/user/user.types';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, returnedObject) => {
      returnedObject.id = returnedObject._id?.toString();
      delete returnedObject._id;
      delete returnedObject.passwordHash;
      delete returnedObject.refreshToken;
      delete returnedObject.createdAt;
      delete returnedObject.updatedAt;
      delete returnedObject.__v;

      return returnedObject;
    },
  },
})
export class User extends Document implements IUser {
  @Prop({ required: true, unique: true, lowercase: true })
  public email: string;

  @Prop({ required: true })
  public username: string;

  @Prop({ required: true })
  public passwordHash: string;

  @Prop({ enum: Role, default: Role.User })
  public role: Role;

  @Prop()
  public refreshToken?: string;

  @Prop()
  public avatarUrl?: string;

  @Prop({ enum: Languages, default: Languages.ENGLISH })
  public language: Languages;

  @Prop({ type: [{ type: Types.ObjectId, ref: Profile.name }] })
  public profiles: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
