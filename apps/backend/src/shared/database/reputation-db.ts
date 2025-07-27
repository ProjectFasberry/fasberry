import type { DB as reputationDBType } from "@repo/shared/types/db/reputation-database-types";
import { Kysely } from "kysely";
import { MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { poolOptsHooks } from "./lobby-db";

export const reputation = new Kysely<reputationDBType>({
  dialect: new MysqlDialect({
    pool: createPool({
      host: Bun.env.REPUTATION_MYSQL_HOST,
      user: Bun.env.MYSQL_USER!,
      password: Bun.env.MYSQL_ROOT_PASSWORD!,
      port: Number(Bun.env.REPUTATION_MYSQL_PORT!),
      database: Bun.env.REPUTATION_MYSQL_DB,
      connectionLimit: 10
    }),
    ...poolOptsHooks("Reputation")
  })
});