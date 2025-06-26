import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { AuthLogInDTO, AuthRegisterDTO } from './dto/auth.dto';
import { TokenService } from './token.service';
import { IAuthResponse } from './types/auth.response';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @UsePipes(new ValidationPipe())
  @Post('register')
  public async register(
    @Body() dto: AuthRegisterDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAuthResponse> {
    const { refreshToken, ...response } = await this.authService.register(dto);
    this.tokenService.addRefreshTokenToResponse(res, refreshToken);

    return response;
  }

  @UsePipes(new ValidationPipe())
  @Post('log-in')
  public async logIn(
    @Body() dto: AuthLogInDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IAuthResponse> {
    const { refreshToken, ...response } = await this.authService.logIn(dto);
    this.tokenService.addRefreshTokenToResponse(res, refreshToken);

    return response;
  }

  @Get('log-in/access-token')
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

  @Get('log-out')
  public async logOut(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const refreshTokenFromCookies = req.cookies[process.env.REFRESH_TOKEN_NAME];

    if (!refreshTokenFromCookies) {
      throw new UnauthorizedException('Unauthorized');
    }

    this.tokenService.removeRefreshTokenFromResponse(res);
    return { message: 'Logged out successfully' };
  }
}
