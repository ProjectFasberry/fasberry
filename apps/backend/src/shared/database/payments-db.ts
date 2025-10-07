import { Kysely, PostgresDialect } from 'kysely';
import type { DB as paymentsDBType } from "@repo/shared/types/db/payments-database-types";
import { Pool, PoolConfig } from 'pg';
import { poolOptsHooks } from './lobby-db';
import { PAYMENTS_POSTGRES_DB, PAYMENTS_POSTGRES_HOST, PAYMENTS_POSTGRES_PASSWORD, PAYMENTS_POSTGRES_PORT, PAYMENTS_POSTGRES_USER } from '../env';

const config: PoolConfig = {
  host: PAYMENTS_POSTGRES_HOST,
  database: PAYMENTS_POSTGRES_DB,
  user: PAYMENTS_POSTGRES_USER,
  password: PAYMENTS_POSTGRES_PASSWORD,
  port: Number(PAYMENTS_POSTGRES_PORT),
  max: 10
}

export const paymentsPool = new Pool(config)

export const payments = new Kysely<paymentsDBType>({
  dialect: new PostgresDialect({
    pool: paymentsPool,
    ...poolOptsHooks("Payments")
  })
});