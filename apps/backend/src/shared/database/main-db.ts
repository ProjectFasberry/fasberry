import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { DB as authDBType } from "@repo/shared/types/db/auth-database-types";
import { poolOptsHooks } from "./lobby-db";

export const main = new Kysely<authDBType>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: Bun.env.AUTHORIZATION_POSTGRES_HOST,
      database: Bun.env.AUTHORIZATION_POSTGRES_DB,
      user: Bun.env.AUTHORIZATION_POSTGRES_USER,
      password: Bun.env.AUTHORIZATION_POSTGRES_PASSWORD,
      port: Number(Bun.env.AUTHORIZATION_POSTGRES_PORT),
      max: 10
    }),
    ...poolOptsHooks("Main")
  })
})