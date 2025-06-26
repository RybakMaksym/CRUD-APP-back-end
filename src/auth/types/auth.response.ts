export interface IAuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    isAdmin: boolean;
  };
  accessToken: string;
  refreshToken: string;
}
