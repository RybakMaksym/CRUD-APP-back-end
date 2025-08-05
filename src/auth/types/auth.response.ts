import type { IUserPayload } from '@/auth/types/user-payload';
import type { ITokens } from '@/token/tokens.types';

export interface IAuthResponse extends ITokens {
  user: IUserPayload;
}
