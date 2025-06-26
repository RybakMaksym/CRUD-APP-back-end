import { Module } from '@nestjs/common';

import { TokenModule } from 'token/token.module';
import { UserModule } from 'user/user.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategies/access-token-stategy';
import { RefreshTokenStrategy } from './strategies/refresh-token-strategy';

@Module({
  imports: [UserModule, TokenModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
