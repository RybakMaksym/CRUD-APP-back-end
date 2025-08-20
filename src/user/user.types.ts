import type { Types } from 'mongoose';

import type { Languages } from '@/enums/languages';
import type { Role } from 'enums/role.enum';

export interface IUser {
  id?: string;
  email: string;
  username: string;
  passwordHash: string;
  role: Role;
  refreshToken?: string;
  avatarUrl?: string;
  language: Languages;
  profiles: Types.ObjectId[];
}
