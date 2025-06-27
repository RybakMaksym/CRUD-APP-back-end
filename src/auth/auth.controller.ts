import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { AuthService } from 'auth/auth.service';
import { LogInUserDTO } from 'auth/dto/auth-log-in.dto';
import { RegisterUserDTO } from 'auth/dto/auth-register.dto';
import { IAuthResponse } from 'auth/types/auth.response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @Post('register')
  public async register(@Body() dto: RegisterUserDTO): Promise<IAuthResponse> {
    return this.authService.registerUser(dto);
  }

  @UsePipes(new ValidationPipe())
  @Post('log-in')
  public async logIn(@Body() dto: LogInUserDTO): Promise<IAuthResponse> {
    return this.authService.logInUser(dto);
  }
}
