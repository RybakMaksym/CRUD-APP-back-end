import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';

import { AccessTokenGuard } from 'auth/guards/access-token.guard';
import { GetUserId } from 'decorators/get-user-id.decorator';
import { Role } from 'enums/role.enum';
import { IMessageReponse } from 'types/message.interfaces';
import { IUser } from 'user/types/user';
import { UserService } from 'user/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('list')
  @UseGuards(AccessTokenGuard)
  public async findAllUsers(@GetUserId() userId: string): Promise<IUser[]> {
    const user = await this.userService.findById(userId);

    if (user.role !== Role.Admin) {
      throw new ForbiddenException('You do not have access to this resource');
    }

    return this.userService.findAll();
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
