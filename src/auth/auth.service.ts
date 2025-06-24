import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { Response } from 'express';

import { User } from 'user/entities/user.entity';

import { UserService } from '../user/user.service';
import { AuthLogInDTO, AuthRegisterDTO } from './dto/auth.dto';
import { AuthResponseDTO } from './dto/auth.response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly JWTservice: JwtService,
    private readonly userService: UserService,
  ) {}

  private issueTokens(userID: string) {
    const payload = { id: userID };
    return {
      accessToken: this.JWTservice.sign(payload, { expiresIn: '1h' }),
      refreshToken: this.JWTservice.sign(payload, { expiresIn: '7d' }),
    };
  }

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
    const tokens = this.issueTokens(user.id);

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
    const tokens = this.issueTokens(user.id);

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

  async getNewTokens(refreshToken: string): Promise<AuthResponseDTO> {
    try {
      const result = await this.JWTservice.verifyAsync(refreshToken);

      if (!result) throw new BadRequestException('Invalid refresh token');

      const user = await this.userService.findById(result.id);

      const tokens = this.issueTokens(user.id);

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
        },
        ...tokens,
      };
    } catch {
      throw new BadRequestException('Invalid or expired refresh token');
    }
  }

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date();
    expiresIn.setDate(
      expiresIn.getDate() + +process.env.EXPIRE_DAY_REFRESH_TOKEN,
    );

    res.cookie(process.env.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      expires: expiresIn,
      secure: true,
      sameSite: 'none',
    });
  }

  removeRefreshTokenFromResponse(res: Response) {
    res.cookie(process.env.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
      sameSite: 'none',
    });
  }
}
