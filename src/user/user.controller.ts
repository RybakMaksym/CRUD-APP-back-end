import { Controller, Get, UseGuards } from '@nestjs/common';

import { JWTAuthGuard } from 'auth/guards/jwt-auth.guard';

import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JWTAuthGuard)
  public async findAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }
}
