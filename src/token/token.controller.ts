import {
  BadGatewayException,
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { RefreshTokenGuard } from 'auth/guards/refresh-token.guard';
import { TokenService } from 'token/token.service';
import { ITokens } from 'token/types/tokens';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('refresh')
  @UseGuards(RefreshTokenGuard)
  public async getNewToken(@Req() req: Request): Promise<ITokens> {
    const refreshToken = req.headers.authorization?.split(' ')[1];

    if (!refreshToken) {
      throw new BadGatewayException('Unauthorized');
    }

    const userId = await this.tokenService.verifyToken(refreshToken);
    const tokens = await this.tokenService.generateJwtTokens(userId);
    await this.tokenService.saveTokenToDb(userId, tokens.refreshToken);

    return tokens;
  }
}
