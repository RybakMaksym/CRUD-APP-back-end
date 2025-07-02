import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from 'auth/auth.module';
import { CloudinaryModule } from 'cloudinary/cloudinary.module';
import { getDbConfig } from 'config/database.config';
import { TokenModule } from 'token/token.module';
import { UserModule } from 'user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDbConfig,
      inject: [ConfigService],
    }),
    UserModule,
    TokenModule,
    AuthModule,
    CloudinaryModule,
  ],
})
export class AppModule {}
