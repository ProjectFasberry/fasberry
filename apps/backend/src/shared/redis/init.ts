import { logger } from "#/utils/config/logger";
import Redis from 'ioredis';

const redis = new Redis({
  port: 6379,
  host: Bun.env.REDIS_HOST,
  password: Bun.env.REDIS_USER_PASSWORD,
  username: Bun.env.REDIS_USER
});

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis client is not initialized');
  }

  return redisClient;
}

export const initRedis = async () => {
  try {
    redisClient = redis
    logger.success("Redis client is connected")
  } catch (err) {
    throw new Error('Redis client connection failed');
  }
}