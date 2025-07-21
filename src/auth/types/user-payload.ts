import type { Role } from '@/enums/role.enum';

export interface IUserPayload {
  id: string;
  email: string;
  username: string;
  role: Role;
  avatarUrl: string;
}
