import { Controller, Get } from '@nestjs/common';

import { Auth } from 'auth/decorators/auth.decorator';

import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Auth()
  findAll() {
    return this.userService.findAll();
  }
}
