import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Role } from 'user/types/role';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      delete ret.passwordHash;
      delete ret.refreshToken;
      delete ret.createdAt;
      delete ret.updatedAt;
      delete ret.__v;

      return ret;
    },
  },
})
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  username: string;

  @Prop({ default: 'user' })
  role: Role;

  @Prop()
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
