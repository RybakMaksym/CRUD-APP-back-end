import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class AuthRegisterDTO {
  @IsString()
  username: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsBoolean()
  @IsOptional()
  isAdmin?: boolean;
}

export class AuthLogInDTO {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
