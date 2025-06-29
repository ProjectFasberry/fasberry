import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { DB as authDBType } from "./auth-db-types";

const authDialect = ({
  host, database, user, password, port
}: DatabaseConnection) => {
  return new PostgresDialect({ pool: new Pool({ database, host, user, port, max: 10, password }) });
};

export const auth = new Kysely<authDBType>({
  dialect: authDialect({
    host: "127.0.0.1",
    database: Bun.env.AUTHORIZATION_POSTGRES_DB!,
    user: Bun.env.AUTHORIZATION_POSTGRES_USER!,
    password: Bun.env.AUTHORIZATION_POSTGRES_PASSWORD!,
    port: Number(Bun.env.AUTHORIZATION_POSTGRES_PORT!),
  }),
});