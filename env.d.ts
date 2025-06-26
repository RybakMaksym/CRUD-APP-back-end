declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: number;
    DB_CONNECTION_URI: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    SALT_ROUNDS: number;
    REFRESH_TOKEN_NAME: string;
    EXPIRE_DAY_ACCESS_TOKEN: number;
    EXPIRE_DAY_REFRESH_TOKEN: number;
  }
}
