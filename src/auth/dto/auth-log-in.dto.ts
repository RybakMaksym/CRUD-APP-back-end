import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LogInUserDTO {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  @IsString()
  public password: string;
}
