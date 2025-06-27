import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ITokens } from 'token/types/tokens';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public generateJwtTokens(userId: string): ITokens {
    const payload = { id: userId };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('EXPIRE_DAY_ACCESS_TOKEN'),
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('EXPIRE_DAY_REFRESH_TOKEN'),
      }),
    };
  }

  public async verifyToken(refreshToken: string): Promise<string> {
    const result = await this.jwtService.verifyAsync<{ id: string }>(
      refreshToken,
      {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      },
    );

    return result.id;
  }
}
