import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { compareHash, hash } from '@/helpers/hash';
import { ITokens } from '@/token/types/tokens';
import { UserService } from '@/user/user.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  public generateJwtTokens(userId: string): ITokens {
    const payload = { id: userId };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRE_IN'),
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRE_IN'),
      }),
    };
  }

  public async saveTokenToDb(userId: string, refreshToken: string) {
    await this.userService.update(userId, {
      refreshToken: hash(refreshToken),
    });
  }

  public async verifyToken(refreshToken: string): Promise<string> {
    const { id } = await this.jwtService.verifyAsync<{ id: string }>(
      refreshToken,
      {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      },
    );

    const user = await this.userService.findById(id);

    if (
      !id ||
      !user.refreshToken ||
      !compareHash(refreshToken, user.refreshToken)
    ) {
      throw new UnauthorizedException('Unauthorized');
    }

    return id;
  }
}
