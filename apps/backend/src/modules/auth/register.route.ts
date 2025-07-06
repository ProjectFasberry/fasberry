import Elysia from "elysia";
import { createUser, generateOfflineUUID, getExistsUser, registerSchema } from "./auth.model";
import { throwError } from "#/helpers/throw-error";
import UnsafePasswords from "@repo/assets/configs/unsafe_passwords.txt"
import { validateAuthenticationRequest } from "#/utils/auth/validate-auth-request";
import ky from "ky";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { auth } from "#/shared/database/auth-db";
import { ipSetup } from "#/lib/middlewares/ip";
import { cookieSetup } from "#/lib/middlewares/cookie";
import { logger } from "#/utils/config/logger";
import { getExistSession } from "../private/validation.route";

const MOJANG_API_URL = "https://api.ashcon.app/mojang/v2/user"

type MojangPayload =
  | { uuid: string }
  | { reason: string, error: string }

async function getLicense(nickname: string) {
  return ky.get(`${MOJANG_API_URL}/${nickname}`, { throwHttpErrors: false }).json<MojangPayload>();
}

const unsafePasswordsSet: Set<string> = new Set(
  UnsafePasswords.split("\n")
    .map((l: string) => l.trim())
    .filter((l: string) => l && l !== "****")
);

export function validatePasswordSafe(password: string): boolean {
  return !unsafePasswordsSet.has(password.trim());
}

async function getUserUUID(nickname: string) {
  let uuid: string | null = null;

  try {
    const license = await getLicense(nickname)

    logger.info(`Player ${nickname} has a ${"error" in license ? "offline" : "license"} account`)

    if ("error" in license) {
      throw new Error(license.reason)
    }

    if (license.uuid) {
      uuid = license.uuid
    }
  } catch (e) {
    if (e instanceof Error) {
      logger.error(e)
    }

    uuid = generateOfflineUUID(nickname)
  }

  return uuid;
}

export const register = new Elysia()
  .use(ipSetup())
  .use(cookieSetup())
  .post("/register", async (ctx) => {
    const { findout, nickname, password, token: cfToken, referrer } = ctx.body

    try {
      // const validateResult = await validateAuthenticationRequest({ token: cfToken, ip: ctx.ip })

      // if (validateResult && "error" in validateResult) {
      //   return ctx.status(HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE, throwError(validateResult.error))
      // }

      const existsUser = await getExistsUser(nickname)

      if (existsUser.result) {
        return ctx.status(400, throwError("User already exists"))
      }

      const isPasswordSafe = validatePasswordSafe(password)

      if (!isPasswordSafe) {
        return ctx.status(401, throwError("Unsafe password"))
      }

      const uuid = await getUserUUID(nickname)

      if (!uuid) {
        return ctx.status(HttpStatusEnum.HTTP_409_CONFLICT, throwError("UUID must be required"))
      }

      const hash = Bun.password.hashSync(password, {
        algorithm: "bcrypt", cost: 10
      })

      const result = await createUser({
        nickname, findout, uuid, referrer, password: hash, ip: ctx.ip
      })

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: { nickname: result.nickname } })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    beforeHandle: async ({ session, ...ctx }) => {
      if (session) {
        const existsSession = await getExistSession(session)

        if (existsSession && Number(existsSession.count)) {
          return ctx.status(HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE, throwError("Authorized"))
        }
        
        return ctx.status(HttpStatusEnum.HTTP_401_UNAUTHORIZED, throwError("Unauthorized"))
      }
    },
    body: registerSchema
  })