import { Types } from 'mongoose';

import { Role } from 'enums/role.enum';

export interface IUser {
  id?: string;
  email: string;
  username: string;
  passwordHash: string;
  role: Role;
  refreshToken?: string;
  avatarUrl?: string;
  profiles: Types.ObjectId[];
}
