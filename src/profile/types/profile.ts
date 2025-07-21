import type { Types } from 'mongoose';

import type { Gender } from '@/enums/gender.enum';

export interface IProfile {
  id?: string;
  name: string;
  gender: Gender;
  birthDate: Date;
  country: string;
  city: string;
  avatarUrl?: string;
  ownerId: Types.ObjectId;
}

export interface IPopulatedProfiles {
  profiles: IProfile[];
}
