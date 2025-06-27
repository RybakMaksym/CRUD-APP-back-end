import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AuthLogInDTO, AuthRegisterDTO } from 'auth/dto/auth.dto';
import { IAuthResponse } from 'auth/types/auth.response';
import { compareHash } from 'helpers/hash';
import { TokenService } from 'token/token.service';
import { User } from 'user/models/user.model';
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

    const isPasswordValid = await compareHash(dto.password, user.passwordHash);

    if (!isPasswordValid) throw new BadRequestException('Invalid password');

    return user;
  }

  public async registerUser(dto: AuthRegisterDTO): Promise<IAuthResponse> {
    const oldUser = await this.userService.findByEmail(dto.email);

    if (oldUser) throw new BadRequestException('User already exists');

    const user = await this.userService.create(dto);
    const tokens = this.tokenService.generateJwtTokens(user.id);
    await this.tokenService.saveTokenToDb(user.id, tokens.refreshToken);

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
    await this.tokenService.saveTokenToDb(user.id, tokens.refreshToken);

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
