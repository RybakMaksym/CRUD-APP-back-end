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
  username: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 32, {
    message: 'Password must be between 8 and 32 characters',
  })
  @Matches(/^[^\s'"`\\]+$/, {
    message:
      'Password must not contain spaces or invalid characters like quotes or backslashes',
  })
  password: string;

  @IsOptional()
  role?: Role;
}
