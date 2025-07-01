import { Role } from 'enums/role.enum';

export type IUser = {
  id?: string;
  email: string;
  username: string;
  passwordHash: string;
  role: Role;
  refreshToken?: string;
};
