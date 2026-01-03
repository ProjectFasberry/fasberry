import type { DB as libertyBansDBType } from "@repo/shared/types/db/libertybans-database-types";
import { Kysely, PostgresDialect } from "kysely";
import pg, { type PoolConfig } from "pg";
import { poolOptsHooks } from "./lobby-db";
import { LIBERTYBANS_POSTGRES_DB, LIBERTYBANS_POSTGRES_HOST, LIBERTYBANS_POSTGRES_PASSWORD, LIBERTYBANS_POSTGRES_PORT, LIBERTYBANS_POSTGRES_USER } from "../env";

const { Pool } = pg;

export const inherit = {
  host: LIBERTYBANS_POSTGRES_HOST,
  user: LIBERTYBANS_POSTGRES_USER,
  password: LIBERTYBANS_POSTGRES_PASSWORD,
  port: Number(LIBERTYBANS_POSTGRES_PORT),
  database: LIBERTYBANS_POSTGRES_DB,
}

const config: PoolConfig = {
  ...inherit,
  max: 10
}

export const libertybansPool = new Pool(config)

export const libertybans = new Kysely<libertyBansDBType>({
  dialect: new PostgresDialect({
    pool: libertybansPool,
    ...poolOptsHooks("Libertybans")
  })
});