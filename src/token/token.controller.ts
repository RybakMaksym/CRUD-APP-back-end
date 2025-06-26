import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

import { TokenService } from './token.service';
import { ITokens } from './types/tokens';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('access-token')
  public async getNewToken(@Req() req: Request): Promise<ITokens> {
    const refreshToken = req.headers.authorization?.split(' ')[1];

    if (!refreshToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    const userId = await this.tokenService.verifyToken(refreshToken);
    return this.tokenService.generateJwtTokens(userId);
  }
}
