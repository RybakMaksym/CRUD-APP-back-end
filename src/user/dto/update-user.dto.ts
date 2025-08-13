import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';

import { CreateUserDTO } from '@/auth/dto/create-user.dto';
import { Languages } from '@/enums/languages';

export class UpdateUserDTO extends PartialType(
  OmitType(CreateUserDTO, ['password'] as const),
) {
  @IsOptional()
  @IsEnum(Languages)
  language?: Languages;
}
