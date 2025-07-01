import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { LogInUserDTO } from 'auth/dto/log-in-user.dto';

export class CreateUserDTO extends PartialType(LogInUserDTO) {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  public username: string;

  @IsOptional()
  @IsBoolean()
  public isAdmin?: boolean;
}
