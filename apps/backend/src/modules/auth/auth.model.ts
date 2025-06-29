import { normalizeIp } from "#/helpers/normalize-ip"
import { auth } from "#/shared/auth-db"
import { Static, t } from "elysia"

// 15 days
export const MIN_SESSION_EXPIRE = 1000 * 60 * 60 * 24 * 15

// 30 days
export const DEFAULT_SESSION_EXPIRE = 1000 * 60 * 60 * 24 * 30

// 15 sessions per user
export const USER_SESSIONS_LIMIT = 15

export async function getExistsUser(nickname: string): Promise<{ hash: string | null, result: boolean }> {
  const query = await auth
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
  expires_at: Date | string,
  info: UAParser.IResult & { ip: string }
}

export async function createSession({ token, expires_at, nickname, info }: CreateSession) {
  const { browser: { name }, ip: rawIp } = info

  let browser = name ?? "Unknown"
  let ip = rawIp === '::1' ? "localhost" : rawIp

  return auth.transaction().execute(async (trx) => {
    await trx
      .deleteFrom("sessions")
      .where("nickname", "=", nickname)
      .where("id", "not in", trx
        .selectFrom("sessions")
        .select("id")
        .where("nickname", "=", nickname)
        .orderBy("created_at", "desc")
        .limit(USER_SESSIONS_LIMIT)
      )
      .execute()

    const user = await trx
      .insertInto("sessions")
      .values({ token, nickname, browser, ip, expires_at })
      .returning(["id", "nickname", "created_at", "expires_at"])
      .executeTakeFirstOrThrow()

    return user;
  })
}

type CreateUserProperties = {
  ip: string,
}

export const authSchema = t.Object({
  nickname: t.String({ minLength: 1 }),
  password: t.String({ minLength: 6 }),
  token: t.String({ minLength: 4 })
})

export const registerSchema = t.Composite([
  authSchema,
  t.Object({
    findout: t.String({ minLength: 1 }),
    referrer: t.Optional(t.String()),
  })
])

type CreateUser = Omit<
  Static<typeof registerSchema>, "token"
>

export async function createUser({
  nickname, findout, password, referrer, uuid, ip
}: CreateUser & { uuid: string } & CreateUserProperties) {
  const query = await auth.transaction().execute(async (trx) => {
    const user = await trx
      .insertInto("AUTH")
      .values({
        NICKNAME: nickname, LOWERCASENICKNAME: nickname.toLowerCase(),
        IP: normalizeIp(ip),
        HASH: password,
        UUID: uuid,
        REGDATE: new Date().getTime()
      })
      .returning(["NICKNAME as nickname", "REGDATE"])
      .executeTakeFirstOrThrow()

    // todo: impl findout inserting
    // const findout = await 

    // todo: impl referral system
    // if (referrer) { }

    return user;
  })

  return query;
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