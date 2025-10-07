import { Kysely } from 'kysely';
import type { DB as lpDBType } from "@repo/shared/types/db/luckperms-database-types";
import { PostgresDialect } from "kysely";
import { Pool, PoolConfig } from "pg";
import { poolOptsHooks } from './lobby-db';
import { LUCKPERMS_POSTGRES_DB, LUCKPERMS_POSTGRES_HOST, LUCKPERMS_POSTGRES_PASSWORD, LUCKPERMS_POSTGRES_PORT, LUCKPERMS_POSTGRES_USER } from '../env';

const config: PoolConfig = {
  host: LUCKPERMS_POSTGRES_HOST,
  database: LUCKPERMS_POSTGRES_DB,
  user: LUCKPERMS_POSTGRES_USER,
  password: LUCKPERMS_POSTGRES_PASSWORD,
  port: Number(LUCKPERMS_POSTGRES_PORT),
  max: 10
}

export const luckpermsPool = new Pool(config)

export const luckperms = new Kysely<lpDBType>({
  dialect: new PostgresDialect({
    pool: luckpermsPool,
    ...poolOptsHooks("Luckperms")
  })
});