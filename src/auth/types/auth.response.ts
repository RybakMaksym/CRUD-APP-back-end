import { IUserPayload } from 'auth/types/user-payload';
import { ITokens } from 'token/types/tokens';

export interface IAuthResponse extends ITokens {
  user: IUserPayload;
}
