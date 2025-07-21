import type { IUserPayload } from '@/auth/types/user-payload';
import type { ITokens } from '@/token/types/tokens';

export interface IAuthResponse extends ITokens {
  user: IUserPayload;
}
