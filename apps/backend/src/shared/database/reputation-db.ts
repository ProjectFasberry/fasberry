import type { DB as reputationDBType } from "@repo/shared/types/db/reputation-database-types";
import { Kysely } from "kysely";
import { MysqlDialect } from "kysely";
import { createPool, PoolOptions } from "mysql2";
import { poolOptsHooks } from "./lobby-db";
import { REPUTATION_MYSQL_DB, REPUTATION_MYSQL_HOST, REPUTATION_MYSQL_PASSWORD, REPUTATION_MYSQL_PORT, REPUTATION_MYSQL_USER } from "../env";

const config: PoolOptions = {
  host: REPUTATION_MYSQL_HOST,
  user: REPUTATION_MYSQL_USER,
  password: REPUTATION_MYSQL_PASSWORD,
  port: Number(REPUTATION_MYSQL_PORT),
  database: REPUTATION_MYSQL_DB,
  connectionLimit: 10
}

export const reputationPool = createPool(config)

export const reputation = new Kysely<reputationDBType>({
  dialect: new MysqlDialect({
    pool: reputationPool,
    ...poolOptsHooks("Reputation")
  })
});