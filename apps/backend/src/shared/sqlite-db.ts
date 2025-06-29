import { Kysely } from 'kysely';
import type { DB as sqliteDBType } from "./sqlite-db-types.ts";
import { Database } from "bun:sqlite";
import { BunSqliteDialect } from 'kysely-bun-sqlite';
import db from "../../../../data/fasberry/db/sqlite.db"

const database = new Database(db)

database.exec("PRAGMA journal_mode = WAL;");

const dialect = new BunSqliteDialect({ database })

export const sqliteDB = new Kysely<sqliteDBType>({ dialect })