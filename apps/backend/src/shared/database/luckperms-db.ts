import { Kysely } from 'kysely';
import type { DB as lpDBType } from "@repo/shared/types/db/luckperms-database-types";
import { PostgresDialect } from "kysely";
import { Pool } from "pg";
import { poolOptsHooks } from './lobby-db';

export const luckperms = new Kysely<lpDBType>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: Bun.env.LUCKPERMS_POSTGRES_HOST,
      database: Bun.env.LUCKPERMS_POSTGRES_DB!,
      user: Bun.env.LUCKPERMS_POSTGRES_USER!,
      password: Bun.env.LUCKPERMS_POSTGRES_PASSWORD!,
      port: Number(Bun.env.LUCKPERMS_POSTGRES_PORT!),
      max: 10
    }),
    ...poolOptsHooks("Luckperms")
  })
});