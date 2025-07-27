import { Kysely } from 'kysely';
import type { DB as sqliteDBType } from "@repo/shared/types/db/sqlite-database-types";
import { Database } from "bun:sqlite";
import { BunSqliteDialect } from 'kysely-bun-sqlite';

const database = new Database(Bun.env.SQLITE_DATABASE_URL)

database.exec("PRAGMA journal_mode = WAL;");

export const sqlite = new Kysely<sqliteDBType>({ 
  dialect: new BunSqliteDialect({ database })
})