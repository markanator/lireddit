declare namespace NodeJS {
  export interface ProcessEnv {
    DB_PORT: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    COOKIE_SECRET: string;
    DB_URI: string;
    REDIS_URL: string;
    PORT: string;
    FRONT_END_URL: string;
  }
}
