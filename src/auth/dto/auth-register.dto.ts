import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

import { Role } from 'user/types/role';

export class AuthRegisterDTO {
  @IsNotEmpty()
  @IsString()
  public username: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  public email: string;

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
