import { PartialType } from '@nestjs/mapped-types';

import { CreateProfileDTO } from '@/profile/dto/create-profile.dto';

export class UpdateProfileDTO extends PartialType(CreateProfileDTO) {}
