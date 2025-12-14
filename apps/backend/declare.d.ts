declare global {
  declare module "*.txt"
  declare module "*.db"
  declare module "*.png"
  declare module "*.jpg"

  namespace NodeJS {
    interface ProcessEnv {
      MYSQL_ROOT_PASSWORD: string;
      MYSQL_USER: string;
      GENERAL_POSTGRES_DB: string;
      GENERAL_POSTGRES_PASSWORD: string;
      GENERAL_POSTGRES_USER: string;
      GENERAL_POSTGRES_PORT: number;
      GENERAL_POSTGRES_HOST: string;
      GENERAL_POSTGRES_DB_URL: string;
      LUCKPERMS_POSTGRES_DB_URL: string;
      LUCKPERMS_POSTGRES_DB: string;
      LUCKPERMS_POSTGRES_PASSWORD: string;
      LUCKPERMS_POSTGRES_USER: string;
      LUCKPERMS_POSTGRES_PORT: number;
      LUCKPERMS_POSTGRES_HOST: string;
      LOBBY_MYSQL_DB: string;
      LOBBY_MYSQL_HOST: string;
      LOBBY_MYSQL_PORT: number;
      LOBBY_MYSQL_DB_URL: string;
      PLAYERPOINTS_MYSQL_DB: string;
      PLAYERPOINTS_MYSQL_HOST: string;
      PLAYERPOINTS_MYSQL_PORT: number;
      PLAYERPOINTS_MYSQL_DB_URL: string;
      REPUTATION_MYSQL_DB: string;
      REPUTATION_MYSQL_HOST: string;
      REPUTATION_MYSQL_PORT: number;
      REPUTATION_MYSQL_DB_URL: string;
      SKINS_MYSQL_DB: string;
      SKINS_MYSQL_HOST: string;
      SKINS_MYSQL_PORT: number;
      SKINS_DATABASE_URL: string;
      BISQUITE_MYSQL_DB: string;
      BISQUITE_MYSQL_HOST: string;
      BISQUITE_MYSQL_PORT: number;
      BISQUITE_MYSQL_DB_URL: string
      SQLITE_DATABASE_URL: string;
      PLAN_MYSQL_DB_URL: string;
      
      NATS_HOST: string;
      NATS_USER: string;
      NATS_PASSWORD: string;

      MINIO_ACCESS_KEY: string;
      MINIO_SECRET_KEY: string;
      MINIO_ENDPOINT: string;

      REDIS_HOST: string;
      REDIS_PASSWORD: string;
      REDIS_USER: string;
      REDIS_PORT: number;

      VOLUME_ENDPOINT: string;
      FRONTEND_ENDPOINT: string;

      HELEKET_MERCHANT_KEY: string;
      HELEKET_PAYMENT_KEY: string;
      HELEKET_PAYOUT_KEY: string;

      CRYPTO_PAY_MAINNET_URL: string;
      CRYPTO_PAY_TESTNET_URL: string;
      CRYPTO_PAY_MAINNET_TOKEN: string;
      CRYPTO_PAY_TESTNET_TOKEN: string;

      CAP_SITE_KEY: string;
      CAP_INSTANCE_URL: string;
      CAP_SECRET: string;

      PANEL_USER: string;
      PANEL_PASSWORD: string;

      RCON_PASSWORD: string;

      LIBERTYBANS_POSTGRES_DB: string;
      LIBERTYBANS_POSTGRES_PASSWORD: string;
      LIBERTYBANS_POSTGRES_USER: string;
      LIBERTYBANS_POSTGRES_PORT: number
      LIBERTYBANS_POSTGRES_HOST: string;

      BOT_GUARD_TOKEN: string;
      BOT_LOGGER_TOKEN: string;

      PORT: string;

      MINESKIN_API_KEY: string;
      MINESKIN_AES_SECRET_KEY: string
    }
  }

  interface PaginatedMeta {
    hasNextPage: boolean,
    hasPrevPage: boolean,
    startCursor?: string,
    endCursor?: string
  }
}

export { }