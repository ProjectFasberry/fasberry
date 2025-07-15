import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { DB as authDBType } from "@repo/shared/types/db/auth-database-types";

const authDialect = ({
  host, database, user, password, port
}: DatabaseConnection) => {
  return new PostgresDialect({ pool: new Pool({ database, host, user, port, max: 10, password }) });
};

export const main = new Kysely<authDBType>({
  dialect: authDialect({
    host: Bun.env.AUTHORIZATION_POSTGRES_HOST!,
    database: Bun.env.AUTHORIZATION_POSTGRES_DB!,
    user: Bun.env.AUTHORIZATION_POSTGRES_USER!,
    password: Bun.env.AUTHORIZATION_POSTGRES_PASSWORD!,
    port: Number(Bun.env.AUTHORIZATION_POSTGRES_PORT!),
  }),
});