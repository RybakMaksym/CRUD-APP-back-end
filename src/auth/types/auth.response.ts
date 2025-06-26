import { User } from 'user/entities/user.entity';

export interface IAuthResponse {
  user: Omit<User, 'passwordHash'>;
  accessToken: string;
  refreshToken: string;
}
