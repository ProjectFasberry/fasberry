import Elysia, { Context } from "elysia";
import { getUserNickname } from "#/modules/auth/auth.model";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { general } from "#/shared/database/main-db";
import { isProduction } from "#/shared/env";
import { setCookie } from "#/utils/auth/cookie";
import { nanoid } from "nanoid";
import { logger } from "#/utils/config/logger";

export const defineOptionalUser = () => new Elysia()
  .use(defineSession())
  .derive({ as: "scoped" }, async ({ session: token }) => {
    let nickname: string | null = null;

    if (token) {
      nickname = await getUserNickname(token);
    }

    return { nickname }
  })

export const defineUser = () => new Elysia()
  .use(defineSession())
  .derive({ as: "scoped" }, async ({ session: token, status }) => {
    if (!token) {
      throw status(HttpStatusEnum.HTTP_401_UNAUTHORIZED)
    }

    const nickname = await getUserNickname(token);

    if (!nickname) {
      throw status(HttpStatusEnum.HTTP_401_UNAUTHORIZED)
    }

    return { nickname }
  })

export const defineSession = () => new Elysia()
  .derive(
    { as: "global" },
    ({ cookie }) => ({ session: cookie["session"].value as string | undefined ?? null })
  )

export function defineClientId(cookie: Context["cookie"]) {
  const existsClientId = cookie[CLIENT_ID_HEADER_KEY].value

  !isProduction && logger.log(`Exists client id ${existsClientId}`)

  if (!existsClientId) {
    const newClientId = nanoid(7)
    const nickname = cookie["nickname"].value ?? null;
    const ip = cookie["ip"].value;

    setCookie({
      cookie,
      key: CLIENT_ID_HEADER_KEY,
      expires: new Date(9999999999999),
      value: newClientId
    });

    !isProduction && logger.log(`Client id [ip=${ip};nickname=${nickname}] updated to ${newClientId}`);
  }
}

export const CLIENT_ID_HEADER_KEY = "client_id"

export const defineInitiator = () => new Elysia()
  .use(defineSession())
  .derive({ as: "scoped" }, async ({ session: token }) => {
    if (!token) return { nickname: null }

    const nickname = await getUserNickname(token)

    return { nickname }
  })
  .derive({ as: "scoped" }, ({ cookie, status, nickname }) => {
    const clientId = cookie[CLIENT_ID_HEADER_KEY].value as string | undefined;

    if (!clientId) {
      console.warn("Before calling defineInitiator, defineClientId must be called.");
      throw status(HttpStatusEnum.HTTP_400_BAD_REQUEST, "Client id is not defined")
    }

    const initiator = nickname ?? clientId;

    return { initiator }
  })

export async function validateAdmin(nickname: string) {
  const result = await general
    .selectFrom("admins")
    .select("id")
    .where("nickname", "=", nickname)
    .executeTakeFirst()

  return Boolean(result?.id)
}

export const defineAdmin = () => new Elysia()
  .use(defineUser())
  .onBeforeHandle(async ({ nickname, status }) => {
    const data = await validateAdmin(nickname);

    if (!data) {
      throw status(HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE)
    }
  })