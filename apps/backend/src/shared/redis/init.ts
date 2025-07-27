import { isProduction } from "#/helpers/is-production";
import { logger } from "#/utils/config/logger";
import Redis from 'ioredis';

let rc: Redis | null = null;

const redis = new Redis({
  host: isProduction ? Bun.env.REDIS_HOST : "localhost",
  port: Bun.env.REDIS_PORT,
  password: Bun.env.REDIS_USER_PASSWORD,
  username: Bun.env.REDIS_USER
});

export const getRedisClient = (): Redis => {
  if (!rc) throw new Error('Redis client is not initialized');
  return rc;
}

export async function initRedis() {
  try {
    rc = redis
    logger.success("Redis client is connected")
  } catch (e) {
    logger.error(`Redis`, e)
  }
}