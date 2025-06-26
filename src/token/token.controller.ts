import {
  Controller,
  Get,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { IAuthResponse } from 'auth/types/auth.response';

import { TokenService } from './token.service';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Get('access-token')
  public async getNewToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAuthResponse> {
    const refreshTokenFromCookies = req.cookies[process.env.REFRESH_TOKEN_NAME];

    if (!refreshTokenFromCookies) {
      this.tokenService.removeRefreshTokenFromResponse(res);
      throw new UnauthorizedException('Unauthorized');
    }

    const { refreshToken, ...response } = await this.tokenService.getNewTokens(
      refreshTokenFromCookies,
    );

    this.tokenService.addRefreshTokenToResponse(res, refreshToken);

    return response;
  }
}
