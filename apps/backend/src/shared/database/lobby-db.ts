import type { DB as lobbyDBType } from "@repo/shared/types/db/lobby-database-types";
import { Kysely } from "kysely";
import { MysqlDialect } from "kysely";
import { createPool } from "mysql2";

const lobbyDialect = ({
  user, password, port, database, host
}: DatabaseConnection) => {
  return new MysqlDialect({ pool: createPool({ database, host, user, password, port, connectionLimit: 10 }) });
};

export const lobby = new Kysely<lobbyDBType>({
  dialect: lobbyDialect({
    user: Bun.env.MYSQL_USER!,
    password: Bun.env.MYSQL_ROOT_PASSWORD!,
    port: Number(Bun.env.LOBBY_MYSQL_PORT!),
    database: "lobby",
    host: "127.0.0.1"
  })
}); 