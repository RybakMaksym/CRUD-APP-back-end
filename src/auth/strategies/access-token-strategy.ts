import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtReValidateResult } from 'auth/types/jwt-validate-result';

type JwtPayload = {
  id: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
      ignoreExpiration: false,
      algorithms: ['HS256'],
    });
  }

  public async validate(payload: JwtPayload): JwtReValidateResult {
    return { userId: payload.id };
  }
}
