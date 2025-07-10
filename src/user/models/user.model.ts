import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Role } from 'enums/role.enum';
import { IUser } from 'user/types/user';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.passwordHash;
      delete ret.refreshToken;
      delete ret.createdAt;
      delete ret.updatedAt;
      delete ret.__v;

      return ret;
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
}

export const UserSchema = SchemaFactory.createForClass(User);
