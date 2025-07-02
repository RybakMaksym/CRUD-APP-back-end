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
import { CloudinaryService } from 'cloudinary/cloudinary.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('avatar'))
  public async register(
    @Body() dto: CreateUserDTO,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<IAuthResponse> {
    let avatarUrl: string | undefined;

    if (file) {
      avatarUrl = await this.cloudinaryService.uploadImage(file);
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
