import type { DB as playerPointsDBType } from "@repo/shared/types/db/player-points-database-types";
import { Kysely } from "kysely";
import { MysqlDialect } from "kysely";
import { createPool, type Pool, type PoolOptions } from "mysql2";
import { poolOptsHooks } from "./lobby-db";
import { PLAYERPOINTS_MYSQL_DB, PLAYERPOINTS_MYSQL_HOST, PLAYERPOINTS_MYSQL_PASSWORD, PLAYERPOINTS_MYSQL_PORT, PLAYERPOINTS_MYSQL_USER } from "../env";

const config: PoolOptions = {
  host: PLAYERPOINTS_MYSQL_HOST,
  user: PLAYERPOINTS_MYSQL_USER!,
  password: PLAYERPOINTS_MYSQL_PASSWORD!,
  port: Number(PLAYERPOINTS_MYSQL_PORT),
  database: PLAYERPOINTS_MYSQL_DB,
  connectionLimit: 10
}

export const playerPointsPool: Pool = createPool(config)

export const playerpoints = new Kysely<playerPointsDBType>({
  dialect: new MysqlDialect({
    pool: playerPointsPool,
    ...poolOptsHooks("Playerpoints")
  })
});