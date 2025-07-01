import type { DB as reputationDBType } from "../types/reputation-database-types.js";
import { Kysely } from "kysely";
import { MysqlDialect } from "kysely";
import { createPool } from "mysql2";

const reputationDialect = ({
  user, password, port, database, host
}: DatabaseConnection) => {
  return new MysqlDialect({ pool: createPool({ database, host, user, password, port, connectionLimit: 10 }) });
};

export const reputation = new Kysely<reputationDBType>({
  dialect: reputationDialect({
    user: Bun.env.MYSQL_USER!,
    password: Bun.env.MYSQL_ROOT_PASSWORD!,
    port: Number(Bun.env.REPUTATION_MYSQL_PORT!),
    database: "reputation",
    host: "127.0.0.1"
  })
});