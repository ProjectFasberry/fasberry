import type { DB as bisquiteDBType } from "@repo/shared/types/db/bisquite-database-types";
import { Kysely } from "kysely";
import { MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { poolOptsHooks } from "./lobby-db";

export const bisquite = new Kysely<bisquiteDBType>({
  dialect: new MysqlDialect({
    pool: createPool({
      host: Bun.env.BISQUITE_MYSQL_HOST,
      user: Bun.env.MYSQL_USER,
      password: Bun.env.MYSQL_ROOT_PASSWORD,
      port: Number(Bun.env.BISQUITE_MYSQL_PORT),
      database: Bun.env.BISQUITE_MYSQL_DB, 
      connectionLimit: 10
    }),
    ...poolOptsHooks("Bisquite")
  })
}); 