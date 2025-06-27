import { Role } from 'user/types/role';

export interface IAuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    role: Role;
  };
  accessToken: string;
  refreshToken: string;
}
