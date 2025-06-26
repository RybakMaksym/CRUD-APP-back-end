import { Module } from '@nestjs/common';

import { AuthController } from 'auth/auth.controller';
import { AuthService } from 'auth/auth.service';
import { AccessTokenStrategy } from 'auth/strategies/access-token-stategy';
import { RefreshTokenStrategy } from 'auth/strategies/refresh-token-strategy';
import { TokenModule } from 'token/token.module';
import { UserModule } from 'user/user.module';

@Module({
  imports: [UserModule, TokenModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
