import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AccessTokenGuard } from 'auth/guards/access-token.guard';
import { AVATAR_VALIDATION_OPTIONS } from 'constants/avatar-validation-options.constants';
import { GetUserId } from 'decorators/get-user-id.decorator';
import { Role } from 'enums/role.enum';
import { FileUploadService } from 'file-upload/file-upload.service';
import { IMessageReponse } from 'types/message.interfaces';
import { UpdateUserDTO } from 'user/dto/update-user.dto';
import { IUser } from 'user/types/user';
import { UserService } from 'user/user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get('list')
  @UseGuards(AccessTokenGuard)
  public async findAllUsers(@GetUserId() userId: string): Promise<IUser[]> {
    const user = await this.userService.findById(userId);

    if (user.role !== Role.Admin) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    return this.userService.findAll();
  }

  @Get('search')
  @UseGuards(AccessTokenGuard)
  public async searchUsers(
    @GetUserId() userId: string,
    @Query('query') query: string,
  ): Promise<IUser[]> {
    const user = await this.userService.findById(userId);

    if (user.role !== Role.Admin) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    return this.userService.searchUsers(query);
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  public async findUserById(
    @GetUserId() myId: string,
    @Param('id') userId: string,
  ): Promise<IUser> {
    const user = await this.userService.findById(myId);

    if (user.role !== Role.Admin) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    return this.userService.findById(userId);
  }

  @Get('profile')
  @UseGuards(AccessTokenGuard)
  public async findMeById(@GetUserId() userId: string): Promise<IUser> {
    return this.userService.findById(userId);
  }

  @Patch('/update/:id')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('avatar', AVATAR_VALIDATION_OPTIONS))
  public async updateUserById(
    @GetUserId() myId: string,
    @Param('id') userId: string,
    @Body() dto: UpdateUserDTO,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<IMessageReponse> {
    const admin = await this.userService.findById(myId);

    if (admin.role !== Role.Admin) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && (await this.userService.isEmailTaken(userId, dto.email))) {
      throw new BadRequestException('This email already taken');
    }

    const role =
      dto.isAdmin !== undefined
        ? dto.isAdmin
          ? Role.Admin
          : Role.User
        : user.role;

    const avatarUrl = file
      ? await this.fileUploadService.uploadImage(file)
      : user.avatarUrl;

    await this.userService.update(userId, {
      username: dto.username ?? user.username,
      email: dto.email ?? user.email,
      role,
      avatarUrl,
    });

    return { message: 'User updated successfuly' };
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  public async deleteUserById(
    @GetUserId() myId: string,
    @Param('id') userId: string,
  ): Promise<IMessageReponse> {
    const user = await this.userService.findById(myId);

    if (user.role !== Role.Admin) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    await this.userService.delete(userId);

    return { message: 'User deleted successfuly' };
  }
}
