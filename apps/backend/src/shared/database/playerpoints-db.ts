import type { DB as playerPointsDBType } from "@repo/shared/types/db/player-points-database-types";
import { Kysely } from "kysely";
import { MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { poolOptsHooks } from "./lobby-db";

export const playerpoints = new Kysely<playerPointsDBType>({
  dialect: new MysqlDialect({
    pool: createPool({
      host: Bun.env.PLAYERPOINTS_MYSQL_HOST,
      user: Bun.env.MYSQL_USER!,
      password: Bun.env.MYSQL_ROOT_PASSWORD!,
      port: Number(Bun.env.PLAYERPOINTS_MYSQL_PORT!),
      database: Bun.env.PLAYERPOINTS_MYSQL_DB,
      connectionLimit: 10
    }),
    ...poolOptsHooks("Playerpoints")
  })
});