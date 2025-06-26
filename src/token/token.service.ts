import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ITokens } from './types/tokens';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  public generateJwtTokens(userId: string): ITokens {
    const payload = { id: userId };

    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: `${process.env.EXPIRE_DAY_ACCESS_TOKEN}d`,
      }),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: `${process.env.EXPIRE_DAY_REFRESH_TOKEN}d`,
      }),
    };
  }

  public async verifyToken(refreshToken: string): Promise<string> {
    const result = await this.jwtService.verifyAsync<{ id: string }>(
      refreshToken,
    );
    if (!result?.id) throw new UnauthorizedException('Unauthorized');
    return result.id;
  }
}
