import type { DB as lobbyDBType } from "@repo/shared/types/db/lobby-database-types";
import { Kysely } from "kysely";
import { MysqlDialect } from "kysely";
import { createPool, PoolOptions } from "mysql2";
import { isProduction, LOBBY_MYSQL_DB, LOBBY_MYSQL_HOST, LOBBY_MYSQL_PASSWORD, LOBBY_MYSQL_PORT, LOBBY_MYSQL_USER } from "../env";

export const poolOptsHooks = (name: string) => ({
  onCreateConnection: async () => {
    if (!isProduction) {
      console.log(`New ${name} DB connection created`);
    }
  }
})

const config: PoolOptions = {
  host: LOBBY_MYSQL_HOST,
  user: LOBBY_MYSQL_USER,
  password: LOBBY_MYSQL_PASSWORD,
  port: Number(LOBBY_MYSQL_PORT),
  database: LOBBY_MYSQL_DB,
  connectionLimit: 10
}

export const lobbyPool = createPool(config)

export const lobby = new Kysely<lobbyDBType>({
  dialect: new MysqlDialect({
    pool: lobbyPool,
    ...poolOptsHooks("Lobby")
  })
});