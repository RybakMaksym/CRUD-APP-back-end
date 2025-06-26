import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

import { UserService } from 'user/user.service';

import { IAuthResponse } from './types/auth.response';
import { ITokens } from './types/tokens';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  public generateJwtTokens(userID: string): ITokens {
    const payload = { id: userID };

    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: `${process.env.EXPIRE_DAY_ACCESS_TOKEN}d`,
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: `${process.env.EXPIRE_DAY_REFRESH_TOKEN}d`,
      }),
    };
  }

  private async verifyToken(refreshToken: string): Promise<any> {
    const result = await this.jwtService.verifyAsync(refreshToken);
    if (!result) throw new UnauthorizedException('Unauthorized');

    return result;
  }

  public async getNewTokens(refreshToken: string): Promise<IAuthResponse> {
    try {
      const result = await this.verifyToken(refreshToken);

      const user = await this.userService.findById(result.id);

      const tokens = this.generateJwtTokens(user.id);

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
      throw new UnauthorizedException('Unauthorized');
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
