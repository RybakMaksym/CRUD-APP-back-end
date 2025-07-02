import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from 'auth/auth.service';
import { CurrentUserId } from 'auth/decorators/current-user-id.decorator';
import { CreateUserDTO } from 'auth/dto/create-user.dto';
import { LogInUserDTO } from 'auth/dto/log-in-user.dto';
import { IAuthResponse } from 'auth/types/auth.response';
import { LogOutResponse } from 'auth/types/log-out.response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  public async register(@Body() dto: CreateUserDTO): Promise<IAuthResponse> {
    return this.authService.registerUser(dto);
  }

  @Post('log-in')
  public async logIn(@Body() dto: LogInUserDTO): Promise<IAuthResponse> {
    return this.authService.logInUser(dto);
  }

  @Post('log-out')
  public async logOut(
    @CurrentUserId() userId: string,
  ): Promise<LogOutResponse> {
    await this.authService.logOutUser(userId);

    return {
      message: 'Log out successfully',
    };
  }
}
