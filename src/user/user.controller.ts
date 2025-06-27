import { Controller, Get, UseGuards } from '@nestjs/common';

import { AccessTokenGuard } from 'auth/guards/access-token.guard';
import { User } from 'user/entities/user.entity';
import { UserService } from 'user/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('list')
  @UseGuards(AccessTokenGuard)
  public async findAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }
}
