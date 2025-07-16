import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

import { Gender } from '@/enums/gender.enum';

export class CreateProfileDTO {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  public name: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  public gender: Gender;

  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  public birthDate: Date;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  public country: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  public city: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  public avatarUrl?: string;
}
