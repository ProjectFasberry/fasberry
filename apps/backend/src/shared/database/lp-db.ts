import { Kysely } from 'kysely';
import type { DB as lpDBType } from "../types/luckperms-database-types";
import { PostgresDialect } from "kysely";
import { Pool } from "pg";

export const lpDialect = ({
  host, database, user, password, port
}: DatabaseConnection) => {
  return new PostgresDialect({ pool: new Pool({ database, host, port, password, user, max: 10 }) });
};

export const luckperms = new Kysely<lpDBType>({ dialect: lpDialect({
    host: "127.0.0.1",
    database: Bun.env.LUCKPERMS_POSTGRES_DB!,
    user: Bun.env.LUCKPERMS_POSTGRES_USER!,
    password: Bun.env.LUCKPERMS_POSTGRES_PASSWORD!,
    port: Number(Bun.env.LUCKPERMS_POSTGRES_PORT!),
  }) 
});