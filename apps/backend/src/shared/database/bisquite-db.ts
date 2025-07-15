import type { DB as bisquiteDBType } from "@repo/shared/types/db/bisquite-database-types";
import { Kysely } from "kysely";
import { MysqlDialect } from "kysely";
import { createPool } from "mysql2";

const bisquiteDialect = ({
  user, password, port, database, host
}: DatabaseConnection) => {
  return new MysqlDialect({ 
    pool: createPool({ database, host, user, password, port, connectionLimit: 10 }) 
  });
};

export const bisquite = new Kysely<bisquiteDBType>({
  dialect: bisquiteDialect({
    user: Bun.env.MYSQL_USER!,
    password: Bun.env.MYSQL_ROOT_PASSWORD!,
    port: Number(Bun.env.BISQUITE_MYSQL_PORT!),
    database: "bisquite",
    host: "127.0.0.1"
  })
}); 