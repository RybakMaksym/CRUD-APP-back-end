import { User } from 'user/entities/user.entity';

export interface IAuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken?: string;
}
