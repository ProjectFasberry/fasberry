import Redis, { RedisOptions } from 'ioredis';
import { exit } from 'node:process';
import { logger } from "#/utils/config/logger";
import { isProduction, REDIS_HOST as host, REDIS_PORT, REDIS_PASSWORD, REDIS_USER } from "../env";

const redisLogger = logger.withTag("Redis")

let redis: Redis | null = null;

const config: RedisOptions = {
  host: isProduction ? host : "127.0.0.1",
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  username: REDIS_USER
}

export const getRedis = (): Redis => {
  if (!redis) throw new Error('Redis client is not initialized');
  return redis;
}

export async function initRedis() {
  try {
    redis = new Redis(config);
    redisLogger.success(`Connected to ${config.host}:${config.port}`)
  } catch (e) {
    redisLogger.error(e)
    exit(1)
  }
}