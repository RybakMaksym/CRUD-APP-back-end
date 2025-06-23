declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: number;
    DB_CONNECTION_URI: string;
  }
}
