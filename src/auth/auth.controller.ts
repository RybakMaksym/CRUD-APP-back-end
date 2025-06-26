import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { AuthService } from 'auth/auth.service';
import { AuthRegisterDTO, AuthLogInDTO } from 'auth/dto/auth.dto';
import { IAuthResponse } from 'auth/types/auth.response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @Post('register')
  public async register(@Body() dto: AuthRegisterDTO): Promise<IAuthResponse> {
    return this.authService.register(dto);
  }

  @UsePipes(new ValidationPipe())
  @Post('log-in')
  public async logIn(@Body() dto: AuthLogInDTO): Promise<IAuthResponse> {
    return this.authService.logIn(dto);
  }
}
