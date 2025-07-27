import type { DB as skinsDBType } from "@repo/shared/types/db/skins-database-types";
import { Kysely } from "kysely";
import { MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { poolOptsHooks } from "./lobby-db";

export const skins = new Kysely<skinsDBType>({
  dialect: new MysqlDialect({
    pool: createPool({
      host: Bun.env.SKINS_MYSQL_HOST,
      user: Bun.env.MYSQL_USER,
      password: Bun.env.MYSQL_ROOT_PASSWORD,
      port: Number(Bun.env.SKINS_MYSQL_PORT),
      database: Bun.env.SKINS_MYSQL_DB,
      connectionLimit: 10
    }),
    ...poolOptsHooks("Skins")
  })
});