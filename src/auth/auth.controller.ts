import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';

import { AuthService } from 'auth/auth.service';
import { CreateUserDTO } from 'auth/dto/create-user.dto';
import { LogInUserDTO } from 'auth/dto/log-in-user.dto';
import { RefreshTokenGuard } from 'auth/guards/refresh-token.guard';
import { IAuthResponse } from 'auth/types/auth.response';
import { TokenService } from 'token/token.service';
import { IMessageReponse } from 'types/message.interfaces';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('register')
  public async register(@Body() dto: CreateUserDTO): Promise<IAuthResponse> {
    return this.authService.registerUser(dto);
  }

  @Post('log-in')
  public async logIn(@Body() dto: LogInUserDTO): Promise<IAuthResponse> {
    return this.authService.logInUser(dto);
  }

  @Post('log-out')
  @UseGuards(RefreshTokenGuard)
  public async logOut(
    @Headers('authorization') authorization?: string,
  ): Promise<IMessageReponse> {
    const refreshToken = authorization?.split(' ')[1];

    const userId = await this.tokenService.verifyToken(refreshToken);
    await this.authService.logOutUser(userId);

    return {
      message: 'Log out successfully',
    };
  }
}
