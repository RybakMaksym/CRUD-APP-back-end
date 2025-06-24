import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { verify } from 'argon2';

import { User } from 'user/entities/user.entity';

import { UserService } from '../user/user.service';
import { AuthLogInDTO, AuthRegisterDTO } from './dto/auth.dto';
import { AuthResponseDTO } from './dto/auth.response.dto';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  private async validateUser(dto: AuthLogInDTO): Promise<User> {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await verify(user.password, dto.password);

    if (!isPasswordValid) throw new BadRequestException('Invalid password');

    return user;
  }

  async register(dto: AuthRegisterDTO): Promise<AuthResponseDTO> {
    const oldUser = await this.userService.findByEmail(dto.email);

    if (oldUser) throw new BadRequestException('User already exists');

    const user = await this.userService.create(dto);
    const tokens = this.tokenService.issueTokens(user.id);

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

  async logIn(dto: AuthLogInDTO): Promise<AuthResponseDTO> {
    const user = await this.validateUser(dto);
    const tokens = this.tokenService.issueTokens(user.id);

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
