import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

import { LogInUserDTO } from 'auth/dto/auth-log-in.dto';

export class RegisterUserDTO extends PartialType(LogInUserDTO) {
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
  @IsBoolean()
  public isAdmin?: boolean;
}
