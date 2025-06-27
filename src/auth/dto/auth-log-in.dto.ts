import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthLogInDTO {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
