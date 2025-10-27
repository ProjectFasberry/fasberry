import Elysia from "elysia";
import { getUserNickname } from "#/modules/auth/auth.model";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { general } from "#/shared/database/main-db";
import { isProduction } from "#/shared/env";
import { SESSION_KEY, setCookie } from "#/utils/auth/cookie";
import { nanoid } from "nanoid";
import { logger } from "#/utils/config/logger";

export const validateLogger = logger.withTag("Validation")

export const defineOptionalUser = () => new Elysia()
  .use(defineSession())
  .derive(async ({ session }) => {
    if (!isProduction) {
      validateLogger.log("defineOptionalUser");
    }

    let nickname: string | null = null;

    if (session) {
      nickname = await getUserNickname(session);
    }

    return { nickname }
  })
  .as("scoped")

export const defineUser = () => new Elysia()
  .use(defineSession())
  .derive(async ({ session, status }) => {
    if (!isProduction) {
      validateLogger.log("defineUser");
    }

    if (!session) {
      throw status(HttpStatusEnum.HTTP_401_UNAUTHORIZED)
    }

    const nickname: string | null = await getUserNickname(session);

    if (!nickname) {
      throw status(HttpStatusEnum.HTTP_401_UNAUTHORIZED)
    }

    return { nickname }
  })
  .as("scoped")

export const defineSession = () => new Elysia()
  .derive(({ cookie }) => {
    const sessionCookie = cookie[SESSION_KEY];
    const session = sessionCookie.value as string | undefined;
    return { session }
  })
  .as("global")

export const defineClientId = () => new Elysia()
  .derive(async ({ cookie }) => {
    if (!isProduction) {
      validateLogger.log("defineClientId");
    }

    const existsClientId = cookie[CLIENT_ID_HEADER_KEY].value

    if (!isProduction) {
      logger.log(`Exists client id ${existsClientId}`)
    }

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

      if (!isProduction) {
        logger.log(`Client id [ip=${ip};nickname=${nickname}] updated to ${newClientId}`);
      }
    }
  })
  .as("scoped")

export const CLIENT_ID_HEADER_KEY = "client_id"

export const defineInitiator = () => new Elysia()
  .use(defineSession())
  .use(defineOptionalUser())
  .derive(({ cookie, status, nickname }) => {
    if (!isProduction) {
      validateLogger.log("defineInitiator");
    }

    const clientId = cookie[CLIENT_ID_HEADER_KEY].value as string | undefined;

    if (!clientId) {
      console.warn("Before calling defineInitiator, defineClientId must be called.");
      throw status(HttpStatusEnum.HTTP_400_BAD_REQUEST, "Client id is not defined")
    }

    const initiator = nickname ?? clientId;

    return { initiator }
  })
  .as("scoped")

export const defineUserRole = () => new Elysia()
  .use(defineUser())
  .derive(async ({ nickname }) => {
    if (!isProduction) {
      validateLogger.log("defineUserRole");
    }
    
    const role = await general
      .selectFrom("players")
      .innerJoin("roles", "roles.id", "players.role_id")
      .select(["roles.id", "roles.name"])
      .where("players.nickname", "=", nickname)
      .executeTakeFirstOrThrow();

    return { role }
  })
  .as("scoped")