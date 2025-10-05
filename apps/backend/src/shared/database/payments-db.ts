import { Kysely, PostgresDialect } from 'kysely';
import type { DB as paymentsDBType } from "@repo/shared/types/db/payments-database-types";
import { Pool } from 'pg';
import { poolOptsHooks } from './lobby-db';

export const payments = new Kysely<paymentsDBType>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: Bun.env.GENERAL_POSTGRES_HOST,
      database: Bun.env.PAYMENTS_POSTGRES_DB,
      user: Bun.env.GENERAL_POSTGRES_USER,
      password: Bun.env.GENERAL_POSTGRES_PASSWORD,
      port: Number(Bun.env.GENERAL_POSTGRES_PORT),
      max: 10
    }),
    ...poolOptsHooks("Payments")
  })
});