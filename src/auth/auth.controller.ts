import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from 'auth/auth.service';
import { CreateUserDTO } from 'auth/dto/create-user.dto';
import { LogInUserDTO } from 'auth/dto/log-in-user.dto';
import { IAuthResponse } from 'auth/types/auth.response';

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
}
