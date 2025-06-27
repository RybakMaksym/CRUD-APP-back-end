import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtReValidateResult } from 'auth/types/jwt-validate-result';

type JwtPayload = {
  id: string;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET'),
      ignoreExpiration: false,
      algorithms: ['HS256'],
    });
  }

  public async validate(payload: JwtPayload): JwtReValidateResult {
    return { userId: payload.id };
  }
}
