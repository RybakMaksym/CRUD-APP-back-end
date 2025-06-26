import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

import { UserService } from 'user/user.service';

import { AuthResponseDTO } from './dto/auth.response.dto';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  public issueTokens(userID: string): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload = { id: userID };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '1h' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  public async getNewTokens(refreshToken: string): Promise<AuthResponseDTO> {
    try {
      const result = await this.jwtService.verifyAsync(refreshToken);

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

  public addRefreshTokenToResponse(res: Response, refreshToken: string) {
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

  public removeRefreshTokenFromResponse(res: Response) {
    res.cookie(process.env.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
      sameSite: 'none',
    });
  }
}
