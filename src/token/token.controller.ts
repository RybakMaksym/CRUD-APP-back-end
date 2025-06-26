import {
  Controller,
  Get,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ITokens } from 'token/types/tokens';

import { RefreshTokenGuard } from 'auth/guards/refresh-token.guard';
import { TokenService } from 'token/token.service';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('access-token')
  @UseGuards(RefreshTokenGuard)
  public async getNewToken(@Req() req: Request): Promise<ITokens> {
    const refreshToken = req.headers.authorization?.split(' ')[1];

    if (!refreshToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    const userId = await this.tokenService.verifyToken(refreshToken);
    return this.tokenService.generateJwtTokens(userId);
  }
}
