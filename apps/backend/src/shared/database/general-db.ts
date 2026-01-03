import { Kysely, PostgresDialect } from "kysely";
import pg, { type PoolConfig } from "pg";
import type { DB as authDBType } from "@repo/shared/types/db/auth-database-types";
import { poolOptsHooks } from "./lobby-db";
import { GENERAL_POSTGRES_DB, GENERAL_POSTGRES_HOST, GENERAL_POSTGRES_PASSWORD, GENERAL_POSTGRES_PORT, GENERAL_POSTGRES_USER } from "../env";

const { Pool } = pg;

export const inherit = {
  host: GENERAL_POSTGRES_HOST,
  database: GENERAL_POSTGRES_DB,
  user: GENERAL_POSTGRES_USER,
  password: GENERAL_POSTGRES_PASSWORD,
  port: Number(GENERAL_POSTGRES_PORT),
}

const config: PoolConfig = {
  ...inherit,
  max: 10
}

export const generalPool = new Pool(config)

export const general = new Kysely<authDBType>({
  dialect: new PostgresDialect({
    pool: generalPool,
    ...poolOptsHooks("General")
  })
})