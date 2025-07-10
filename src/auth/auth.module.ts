import { Module } from '@nestjs/common';

import { AuthController } from 'auth/auth.controller';
import { AuthService } from 'auth/auth.service';
import { AccessTokenStrategy } from 'auth/strategies/access-token-strategy';
import { RefreshTokenStrategy } from 'auth/strategies/refresh-token-strategy';
import { FileUploadModule } from 'file-upload/file-upload.module';
import { TokenModule } from 'token/token.module';
import { UserModule } from 'user/user.module';

@Module({
  imports: [UserModule, TokenModule, FileUploadModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
