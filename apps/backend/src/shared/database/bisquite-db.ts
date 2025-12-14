import type { DB as bisquiteDBType } from "@repo/shared/types/db/bisquite-database-types";
import { Kysely } from "kysely";
import { MysqlDialect } from "kysely";
import { createPool, type Pool, type PoolOptions } from "mysql2";
import { poolOptsHooks } from "./lobby-db";
import { BISQUITE_MYSQL_DB, BISQUITE_MYSQL_HOST, BISQUITE_MYSQL_PASSWORD, BISQUITE_MYSQL_PORT, BISQUITE_MYSQL_USER } from "../env";

export const inherit = {
  host: BISQUITE_MYSQL_HOST,
  user: BISQUITE_MYSQL_USER,
  password: BISQUITE_MYSQL_PASSWORD,
  port: Number(BISQUITE_MYSQL_PORT),
  database: BISQUITE_MYSQL_DB,
}

const config: PoolOptions = {
  ...inherit,
  connectionLimit: 10
}

export const bisquitePool: Pool = createPool(config)

export const bisquite = new Kysely<bisquiteDBType>({
  dialect: new MysqlDialect({
    pool: bisquitePool,
    ...poolOptsHooks("Bisquite")
  })
});