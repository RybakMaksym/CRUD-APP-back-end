import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { LogInUserDTO } from 'auth/dto/log-in-user.dto';

export class CreateUserDTO extends PartialType(LogInUserDTO) {
  @IsNotEmpty()
  @IsString()
  public username: string;

  @IsOptional()
  @IsBoolean()
  public isAdmin?: boolean;
}
