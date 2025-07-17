import { Transform } from 'class-transformer';
import {
  IsAlphanumeric,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxDate,
} from 'class-validator';

import { Gender } from '@/enums/gender.enum';

export class CreateProfileDTO {
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  @Transform(({ value }) => value?.trim())
  public name: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  public gender: Gender;

  @IsNotEmpty()
  @IsDate()
  @MaxDate(new Date(), { message: 'Birth date cannot be in the future' })
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
