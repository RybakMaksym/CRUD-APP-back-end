import {
  BadGatewayException,
  Controller,
  Get,
  Headers,
  UseGuards,
} from '@nestjs/common';

import { RefreshTokenGuard } from 'auth/guards/refresh-token.guard';
import { TokenService } from 'token/token.service';
import { ITokens } from 'token/types/tokens';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('refresh')
  @UseGuards(RefreshTokenGuard)
  public async getNewToken(
    @Headers('authorization') authorization?: string,
  ): Promise<ITokens> {
    const refreshToken = authorization?.split(' ')[1];

    if (!refreshToken) {
      throw new BadGatewayException('Unauthorized');
    }

    const userId = await this.tokenService.verifyToken(refreshToken);
    const tokens = await this.tokenService.generateJwtTokens(userId);
    await this.tokenService.saveTokenToDb(userId, tokens.refreshToken);

    return tokens;
  }
}
