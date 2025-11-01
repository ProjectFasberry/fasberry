import { normalizeIp } from "#/helpers/normalize-ip"
import { general } from "#/shared/database/main-db"
import { getRedis } from "#/shared/redis/init"
import { logger } from "#/utils/config/logger"
import { safeJsonParse } from "#/utils/config/transforms"
import { DB } from "@repo/shared/types/db/auth-database-types"
import { registerSchema } from "@repo/shared/types/entities/auth"
import { Transaction } from "kysely"
import z from "zod"

export const DEFAULT_SESSION_EXPIRE = 60 * 60 * 24 * 30 // 30 days
export const DEFAULT_SESSION_EXPIRE_MS = 60 * 60 * 24 * 30 * 1000

export const MIN_SESSION_EXPIRE = 60 * 60 * 24 * 15 // 15 days
export const MIN_SESSION_EXPIRE_MS = 60 * 60 * 24 * 15 * 1000

export const USER_SESSIONS_LIMIT = 15 // 15 sessions per user

export const getUserSessionsKey = (nickname: string) => `user_sessions:${nickname}`
export const getUserKey = (token: string) => `session:${token}`

export async function getExistsUser(nickname: string): Promise<{ hash: string | null, result: boolean }> {
  const query = await general
    .selectFrom("AUTH")
    .select("HASH")
    .where("NICKNAME", "=", nickname)
    .executeTakeFirst()

  if (!query) return { hash: null, result: false }

  return { hash: query.HASH, result: true }
}

type CreateSession = {
  token: string,
  nickname: string,
  info: UAParser.IResult & { ip: string }
}

type UserSessionPayload = {
  nickname: string,
  browser: string,
  ip: string
}

export async function getUserNickname(token: string): Promise<string | null> {
  const redis = getRedis()

  const data = await redis.get(getUserKey(token));
  if (!data) return null;

  const result = safeJsonParse<UserSessionPayload>(data)
  if (!result.ok) return null;

  return result.value.nickname ?? null
}

export async function getIsExistsSession(token: string | undefined) {
  if (!token) return false;
  const result = await getUserNickname(token)
  return Boolean(result)
}

export async function createSession(
  { token, info, nickname }: CreateSession
): Promise<CreateSession & { expires_at: Date }> {
  const redis = getRedis()

  const userSessionsKey = getUserSessionsKey(nickname)
  const newSessionKey = getUserKey(token)
  const currentTimestamp = Date.now();

  const pipeline = redis.multi();

  pipeline.zcard(userSessionsKey);

  const results = await pipeline.exec();

  if (!results) {
    throw new Error("Redis transaction failed and returned null.");
  }

  const [execResult] = results;

  if (execResult[0]) {
    throw execResult[0];
  }

  const currentSessionCount = execResult[1] as number;

  if (currentSessionCount >= USER_SESSIONS_LIMIT) {
    console.log(`Limit reached for user ${nickname}. Removing the oldest session.`);

    const oldestSessions = await redis.zrange(userSessionsKey, 0, 0);

    if (oldestSessions.length > 0) {
      const oldestToken = oldestSessions[0];
      const removalPipeline = redis.multi();

      removalPipeline.zrem(userSessionsKey, oldestToken);
      removalPipeline.del(getUserKey(token));

      await removalPipeline.exec();
    }
  }

  const creationPipeline = redis.multi();

  const { browser: { name }, ip: rawIp } = info

  let browser = name ?? "Unknown"
  let ip = rawIp === '::1' ? "localhost" : rawIp

  const payload: UserSessionPayload = { nickname, browser, ip }

  creationPipeline.set(
    newSessionKey, JSON.stringify(payload), 'PX', DEFAULT_SESSION_EXPIRE
  );

  creationPipeline.zadd(userSessionsKey, currentTimestamp, token);
  creationPipeline.expire(userSessionsKey, DEFAULT_SESSION_EXPIRE);

  await creationPipeline.exec();

  const expires_at = new Date(
    Date.now() + DEFAULT_SESSION_EXPIRE_MS
  );

  return { token, nickname, expires_at, info }
}

export async function deleteSession(token: string): Promise<boolean> {
  const redis = getRedis()
  const sessionKey = getUserKey(token)
  const nickname = await redis.get(sessionKey);

  if (!nickname) {
    console.warn(`Attempted to delete a non-existent session with token: ${token}`);
    return false;
  }

  const userSessionsKey = getUserSessionsKey(nickname)

  const pipeline = redis.multi();

  pipeline.del(sessionKey);
  pipeline.zrem(userSessionsKey, token);

  await pipeline.exec();

  return true;
}

export async function refreshSession(token: string) {
  const redis = getRedis()
  const sessionKey = getUserKey(token)
  const remainingTtlMs = await redis.pttl(sessionKey);

  if (remainingTtlMs < 0) {
    return null;
  }

  if (remainingTtlMs < MIN_SESSION_EXPIRE_MS) {
    const nickname = await redis.get(sessionKey);

    if (!nickname) {
      return null;
    }

    const userSessionsKey = getUserSessionsKey(nickname)
    const newExpiresAtTimestamp = Date.now() + DEFAULT_SESSION_EXPIRE_MS;

    const pipeline = redis.multi();

    pipeline.pexpireat(sessionKey, newExpiresAtTimestamp);
    pipeline.pexpireat(userSessionsKey, newExpiresAtTimestamp);

    await pipeline.exec();

    return {
      result: true,
      nickname,
      expires_at: new Date(newExpiresAtTimestamp),
    };
  }

  return null;
}

type CreateUser = Omit<z.infer<typeof registerSchema>, "token"> & {
  uuid: string,
  ip: string
}

async function registerReferrer(
  { referrer, referral, trx }: { referrer: string, referral: string, trx: Transaction<DB> }
) {
  const isExist = await trx
    .selectFrom("players")
    .select("nickname")
    .where("nickname", "=", referrer)
    .executeTakeFirst()

  if (!isExist?.nickname) {
    logger.withTag('Referals').warn(`Referrer ${referrer} is not defined as player`)
    return;
  }

  const isValidByLimitReferrer = await trx
    .selectFrom("referrals")
    .select("id")
    .where("referrer", "=", referrer)
    .execute()

  if (isValidByLimitReferrer.length >= 4) {
    logger.withTag('Referals').warn(`Referals limit by referrer`)
    return;
  }

  const query = await trx
    .insertInto("referrals")
    .values({
      referrer,
      referral
    })
    .executeTakeFirstOrThrow()

  logger.withTag('Referals').log(`Registered new referal ${referral} of ${referrer}`)

  return query;
}

export async function createUser({
  nickname, findout, password, uuid, ip, findoutType
}: CreateUser) {
  const result = await general.transaction().execute(async (trx) => {
    const regDateMs = new Date().getTime();
    const lowerCaseNickname = nickname.toLowerCase();

    const [user, _] = await Promise.all([
      trx
        .insertInto("players")
        .values({
          nickname,
          lower_case_nickname: lowerCaseNickname,
          uuid
        })
        .returning(["nickname"])
        .executeTakeFirstOrThrow(),
      trx
        .insertInto("AUTH")
        .values({
          NICKNAME: nickname,
          LOWERCASENICKNAME: lowerCaseNickname,
          IP: normalizeIp(ip),
          HASH: password,
          UUID: uuid,
          REGDATE: regDateMs
        })
        .returning(["NICKNAME", "REGDATE"])
        .executeTakeFirstOrThrow()
    ])

    if (findoutType === 'referrer') {
      const referrer = findout;
      const referral = nickname;

      await registerReferrer({ trx, referral, referrer })
    } else if (findoutType === 'custom') {
      await trx
        .insertInto("findout")
        .values({ nickname, value: findout })
        .executeTakeFirstOrThrow()
    }

    logger
      .withTag("Auth")
      .log(`New player ${nickname}. Registered ${new Date().toISOString()}`)

    return user;
  })

  return result
}

export function generateOfflineUUID(nickname: string): string {
  const offlineIdentifier = `OfflinePlayer:${nickname}`;

  const hashBuffer = new Bun
    .CryptoHasher('md5')
    .update(offlineIdentifier)
    .digest();

  const hashArray = new Uint8Array(hashBuffer);

  hashArray[6] = (hashArray[6] & 0x0f) | 0x30;
  hashArray[8] = (hashArray[8] & 0x3f) | 0x80;

  const uuid = Array.from(hashArray)
    .map((byte) => ("00" + byte.toString(16)).slice(-2))
    .join("");

  const raw = [
    uuid.slice(0, 8),
    uuid.slice(8, 12),
    uuid.slice(12, 16),
    uuid.slice(16, 20),
    uuid.slice(20),
  ]

  return raw.join("-");
}