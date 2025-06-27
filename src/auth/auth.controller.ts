import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { AuthService } from 'auth/auth.service';
import { AuthLogInDTO } from 'auth/dto/auth-log-in.dto';
import { AuthRegisterDTO } from 'auth/dto/auth-register.dto';
import { IAuthResponse } from 'auth/types/auth.response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @Post('register')
  public async register(@Body() dto: AuthRegisterDTO): Promise<IAuthResponse> {
    return this.authService.registerUser(dto);
  }

  @UsePipes(new ValidationPipe())
  @Post('log-in')
  public async logIn(@Body() dto: AuthLogInDTO): Promise<IAuthResponse> {
    return this.authService.logInUser(dto);
  }
}
