import { Controller, ForbiddenException, Get, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from 'auth/guards/access-token.guard';
import { GetUserId } from 'decorators/get-user-id.decorator';
import { Role } from 'enums/role.enum';
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

  @Get('me')
  @UseGuards(AccessTokenGuard)
  public async findUserById(@GetUserId() userId: string): Promise<IUser> {
    return this.userService.findById(userId);
  }
}
