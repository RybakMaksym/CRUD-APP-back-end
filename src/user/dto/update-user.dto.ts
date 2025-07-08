import { OmitType, PartialType } from '@nestjs/mapped-types';

import { CreateUserDTO } from 'auth/dto/create-user.dto';

export class UpdateUserDTO extends PartialType(
  OmitType(CreateUserDTO, ['password'] as const),
) {}
