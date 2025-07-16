import { Gender } from '@/enums/gender.enum';

export interface IProfile {
  id?: string;
  name: string;
  gender: Gender;
  birthDate: Date;
  country: string;
  city: string;
  avatarUrl?: string;
}

export interface IPopulatedProfiles {
  profiles: IProfile[];
}
