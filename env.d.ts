declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: number;
    DB_CONNECTION_URI: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    SALT_ROUNDS: number;
    ACCESS_TOKEN_EXPIRE_IN: string;
    REFRESH_TOKEN_EXPIRE_IN: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  }
}
