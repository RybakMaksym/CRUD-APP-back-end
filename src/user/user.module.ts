import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FileUploadModule } from '@/file-upload/file-upload.module';
import { NotificationModule } from '@/notification/notification.module';
import { User, UserSchema } from '@/user/models/user.model';
import { UserController } from '@/user/user.controller';
import { UserService } from '@/user/user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    FileUploadModule,
    NotificationModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
