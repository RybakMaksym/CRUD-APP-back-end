import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

import { AuthLogInDTO } from 'auth/dto/auth-log-in.dto';
import { Role } from 'user/types/role';

export class AuthRegisterDTO extends PartialType(AuthLogInDTO) {
  @IsNotEmpty()
  @IsString()
  public username: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 32, {
    message: 'Password must be between 8 and 32 characters',
  })
  @Matches(/^[^\s'"`\\]+$/, {
    message:
      'Password must not contain spaces or invalid characters like quotes or backslashes',
  })
  public password: string;

  @IsOptional()
  public role?: Role;
}
