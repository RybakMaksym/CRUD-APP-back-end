import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
  password: string;

  @IsOptional()
  role?: Role;
}
