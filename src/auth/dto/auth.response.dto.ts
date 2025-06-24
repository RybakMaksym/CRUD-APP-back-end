import { IsOptional, IsString } from 'class-validator';

import { User } from 'user/entities/user.entity';

export class AuthResponseDTO {
  user: Omit<User, 'password'>;

  @IsString()
  accessToken: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;
}
