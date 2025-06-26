import { Module } from '@nestjs/common';

import { TokenController } from 'token/token.controller';
import { TokenService } from 'token/token.service';
import { UserModule } from 'user/user.module';

@Module({
  imports: [UserModule],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
