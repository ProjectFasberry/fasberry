import type { DB as skinsDBType } from "@repo/shared/types/db/skins-database-types";
import { Kysely } from "kysely";
import { MysqlDialect } from "kysely";
import { createPool, type Pool, type PoolOptions } from "mysql2";
import { poolOptsHooks } from "./lobby-db";
import { SKINS_MYSQL_DB, SKINS_MYSQL_HOST, SKINS_MYSQL_PASSWORD, SKINS_MYSQL_PORT, SKINS_MYSQL_USER } from "../env";

export const inherit = {
  host: SKINS_MYSQL_HOST,
  user: SKINS_MYSQL_USER,
  password: SKINS_MYSQL_PASSWORD,
  port: Number(SKINS_MYSQL_PORT),
  database: SKINS_MYSQL_DB,
}

const config: PoolOptions = {
  ...inherit,
  connectionLimit: 10
}

export const skinsPool: Pool = createPool(config)

export const skins = new Kysely<skinsDBType>({
  dialect: new MysqlDialect({
    pool: skinsPool,
    ...poolOptsHooks("Skins")
  })
});