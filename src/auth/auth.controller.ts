import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AuthService } from 'auth/auth.service';
import { CreateUserDTO } from 'auth/dto/create-user.dto';
import { LogInUserDTO } from 'auth/dto/log-in-user.dto';
import { IAuthResponse } from 'auth/types/auth.response';
import { AVATAR_VALIDATION_OPTIONS } from 'constants/avatar-validation-options.constants';
import { FileUploadService } from 'file-upload/file-upload.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('avatar', AVATAR_VALIDATION_OPTIONS))
  public async register(
    @Body() dto: CreateUserDTO,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<IAuthResponse> {
    let avatarUrl: string | undefined;

    if (file) {
      avatarUrl = await this.fileUploadService.uploadImage(file);
    }

    return this.authService.registerUser({
      ...dto,
      avatarUrl,
    });
  }

  @Post('log-in')
  public async logIn(@Body() dto: LogInUserDTO): Promise<IAuthResponse> {
    return this.authService.logInUser(dto);
  }
}
