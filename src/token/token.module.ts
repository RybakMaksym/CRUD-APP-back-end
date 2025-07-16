import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { TokenController } from '@/token/token.controller';
import { TokenService } from '@/token/token.service';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [UserModule, JwtModule],
  controllers: [TokenController],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
