declare global {
  declare module "*.txt"
  declare module "*.db"
  declare module "*.png"
  declare module "*.jpg"

  namespace NodeJS {
    interface ProcessEnv {
      AUTHORIZATION_POSTGRES_DB_URL: string;
      AUTHORIZATION_POSTGRES_DB: string;
      AUTHORIZATION_POSTGRES_PASSWORD: string;
      AUTHORIZATION_POSTGRES_USER: string;
      AUTHORIZATION_POSTGRES_PORT: number;
      AUTHORIZATION_POSTGRES_HOST: string;

      PAYMENTS_POSTGRES_DB_URL: string;
      PAYMENTS_POSTGRES_DB: string;
      PAYMENTS_POSTGRES_PASSWORD: string;
      PAYMENTS_POSTGRES_USER: string;
      PAYMENTS_POSTGRES_PORT: number;
      PAYMENT_BACKEND_PORT: number;

      LUCKPERMS_POSTGRES_DB_URL: string;
      LUCKPERMS_POSTGRES_DB: string;
      LUCKPERMS_POSTGRES_PASSWORD: string;
      LUCKPERMS_POSTGRES_USER: string;
      LUCKPERMS_POSTGRES_PORT: number;
      LUCKPERMS_BACKEND_PORT: number;

      SKINS_MYSQL_PORT: number;
      SKINS_DATABASE_URL: string;

      MYSQL_ROOT_PASSWORD: string;
      MYSQL_USER: string;

      SQLITE_DATABASE_URL: string;

      PUBLIC_SUPABASE_URL: string;
      SUPABASE_SERVICE_ROLE_KEY: string;

      NATS_HOST: string;
      NATS_AUTH_TOKEN: string;
    }
  }

  interface PaginatedMeta {
    hasNextPage: boolean,
    hasPrevPage: boolean,
    startCursor: string,
    endCursor: string
  }

  interface DatabaseConnection {
    host: string;
    database: string;
    user: string;
    password: string;
    port: number;
  };
}

export { }