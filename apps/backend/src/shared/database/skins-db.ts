import type { DB as skinsDBType } from "../types/skins-database-types.js";
import { Kysely } from "kysely";
import { MysqlDialect } from "kysely";
import { createPool } from "mysql2";

const skinsDialect = ({
  user, password, port, database, host
}: DatabaseConnection) => {
  return new MysqlDialect({ pool: createPool({ database, host, user, password, port, connectionLimit: 10 }) });
};

export const skins = new Kysely<skinsDBType>({
  dialect: skinsDialect({
    user: Bun.env.MYSQL_USER!,
    password: Bun.env.MYSQL_ROOT_PASSWORD!,
    port: Number(Bun.env.SKINS_MYSQL_PORT!),
    database: "skins_proxy",
    host: "127.0.0.1"
  })
});