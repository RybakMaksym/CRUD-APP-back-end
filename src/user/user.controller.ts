import { Controller, Get } from '@nestjs/common';

import { Auth } from 'auth/decorators/auth.decorator';

import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Auth()
  public async findAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }
}
