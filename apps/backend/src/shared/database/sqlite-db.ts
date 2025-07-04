import { Kysely } from 'kysely';
import type { DB as sqliteDBType } from "@repo/shared/types/db/sqlite-database-types";
import { Database } from "bun:sqlite";
import { BunSqliteDialect } from 'kysely-bun-sqlite';

const database = new Database("G:/web_projects/fasberry-minecraft/data/fasberry/db/sqlite.db")

database.exec("PRAGMA journal_mode = WAL;");

const dialect = new BunSqliteDialect({ database })

export const sqlite = new Kysely<sqliteDBType>({ dialect })