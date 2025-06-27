import { Role } from 'user/types/role';

export interface IUserPayload {
  id: string;
  email: string;
  username: string;
  role: Role;
}
