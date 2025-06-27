import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AuthLogInDTO, AuthRegisterDTO } from 'auth/dto/auth.dto';
import { IAuthResponse } from 'auth/types/auth.response';
import { comparePasswords } from 'helpers/password';
import { TokenService } from 'token/token.service';
import { User } from 'user/entities/user.entity';
import { UserService } from 'user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  private async validateUserPassword(dto: AuthLogInDTO): Promise<User> {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await comparePasswords(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) throw new BadRequestException('Invalid password');

    return user;
  }

  public async registerUser(dto: AuthRegisterDTO): Promise<IAuthResponse> {
    const oldUser = await this.userService.findByEmail(dto.email);

    if (oldUser) throw new BadRequestException('User already exists');

    const user = await this.userService.create(dto);
    const tokens = this.tokenService.generateJwtTokens(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  public async logInUser(dto: AuthLogInDTO): Promise<IAuthResponse> {
    const user = await this.validateUserPassword(dto);
    const tokens = this.tokenService.generateJwtTokens(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }
}
