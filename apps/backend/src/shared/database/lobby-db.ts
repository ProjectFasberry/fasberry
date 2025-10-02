import { isProduction } from "#/helpers/is-production";
import { logger } from "#/utils/config/logger";
import type { DB as lobbyDBType } from "@repo/shared/types/db/lobby-database-types";
import { Kysely } from "kysely";
import { MysqlDialect } from "kysely";
import { createPool } from "mysql2";

export const poolOptsHooks = (name: string) => ({
  onCreateConnection: async () => {
    if (!isProduction) {
      console.log(`New ${name} DB connection created`);
    }
  }
})

export const lobby = new Kysely<lobbyDBType>({
  dialect: new MysqlDialect({
    pool: createPool({
      host: Bun.env.LOBBY_MYSQL_HOST,
      user: Bun.env.MYSQL_USER,
      password: Bun.env.MYSQL_ROOT_PASSWORD,
      port: Number(Bun.env.LOBBY_MYSQL_PORT),
      database: Bun.env.LOBBY_MYSQL_DB,
      connectionLimit: 10
    }),
    ...poolOptsHooks("Lobby")
  })
});