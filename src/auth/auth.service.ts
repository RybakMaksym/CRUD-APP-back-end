import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { comparePasswords } from 'helpers/comparePasswords';
import { User } from 'user/entities/user.entity';
import { UserService } from 'user/user.service';

import { AuthLogInDTO, AuthRegisterDTO } from './dto/auth.dto';
import { TokenService } from './token.service';
import { IAuthResponse } from './types/auth.response';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  private async validateUser(dto: AuthLogInDTO): Promise<User> {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await comparePasswords(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) throw new BadRequestException('Invalid password');

    return user;
  }

  public async register(dto: AuthRegisterDTO): Promise<IAuthResponse> {
    const oldUser = await this.userService.findByEmail(dto.email);

    if (oldUser) throw new BadRequestException('User already exists');

    const user = await this.userService.create(dto);
    const tokens = this.tokenService.generateJwtTokens(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      ...tokens,
    };
  }

  public async logIn(dto: AuthLogInDTO): Promise<IAuthResponse> {
    const user = await this.validateUser(dto);
    const tokens = this.tokenService.generateJwtTokens(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      ...tokens,
    };
  }
}
