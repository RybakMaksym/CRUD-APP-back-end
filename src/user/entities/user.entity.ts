import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  username: string;

  @Prop({ default: false })
  isAdmin: boolean;

  get id(): string {
    return (this as any)._id?.toString();
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
