import { IsEnum, IsOptional } from 'class-validator';

import { Languages } from '@/enums/languages';

export class UpdateUserSettingsDto {
  @IsOptional()
  @IsEnum(Languages)
  language?: Languages;
}
