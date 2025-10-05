import Elysia from "elysia";
import { createUser, generateOfflineUUID, getExistsUser, registerSchema } from "./auth.model";
import { throwError } from "#/helpers/throw-error";
import { validateAuthenticationRequest } from "#/utils/auth/validate-auth-request";
import ky from "ky";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { ipPlugin } from "#/lib/plugins/ip";
import { logError, logger } from "#/utils/config/logger";
import { textSets } from "#/utils/config/load-internal-files";
import { general } from "#/shared/database/main-db";
import { validateAuthStatus } from "./login.route";
import { createEvent } from "../server/events.route";

const MOJANG_API_URL = "https://api.ashcon.app/mojang/v2/user"

type MojangPayload =
  | { uuid: string }
  | { reason: string, error: string }

async function getLicense(nickname: string) {
  return ky.get(`${MOJANG_API_URL}/${nickname}`, { throwHttpErrors: false }).json<MojangPayload>();
}

export function validatePasswordSafe(pwd: string): boolean {
  const unsafePasswords = textSets["unsafe_passwords.txt"];
  return !unsafePasswords.has(pwd.trim())
}

async function getUserUUID(nickname: string) {
  let uuid: string | null = null;

  try {
    const license = await getLicense(nickname)

    logger.info(`Player ${nickname} has a ${"error" in license ? "offline" : "license"} account`)

    if ("error" in license) {
      const error = new Error(license.reason);
      logError(error)
      throw error
    }

    if (license.uuid) {
      uuid = license.uuid
    }
  } catch (e) {
    logError(e);
    uuid = generateOfflineUUID(nickname)
  }

  return uuid;
}

async function checkRegistrationState() {
  const registrationIsEnabled = await general
    .selectFrom("options")
    .select("value")
    .where("name", "=", "registrationEnabled")
    .executeTakeFirst()

  return Boolean(registrationIsEnabled?.value)
}

function afterRegistrationEvents({ nickname }: { nickname: string }) {
  createEvent({ 
    description: `Игрок ${nickname} зарегистрирован`,
    type: "log",
    initiator: "system",
    title: "Регистрация"
  })
}

export const register = new Elysia()
  .use(ipPlugin())
  .use(validateAuthStatus())
  .post("/register", async ({ status, ...ctx }) => {
    const { findout, nickname, password, token: cfToken, referrer } = ctx.body

    const registrationIsEnabled = await checkRegistrationState();

    if (!registrationIsEnabled) {
      return status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError("Authorization is disabled"));
    }

    // const validateResult = await validateAuthenticationRequest({ token: cfToken, ip: ctx.ip })

    // if (validateResult && "error" in validateResult) {
    //   return ctx.status(HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE, throwError(validateResult.error))
    // }

    const existsUser = await getExistsUser(nickname)

    if (existsUser.result) {
      return status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError("User already exists"))
    }

    const isPasswordSafe = validatePasswordSafe(password)

    if (!isPasswordSafe) {
      return status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError("Unsafe password"))
    }

    const uuid = await getUserUUID(nickname)

    if (!uuid) {
      return status(HttpStatusEnum.HTTP_409_CONFLICT, throwError("UUID must be required"))
    }

    const hash = Bun.password.hashSync(password, {
      algorithm: "bcrypt", cost: 10
    })

    const result = await createUser({
      nickname, findout, uuid, referrer, password: hash, ip: ctx.ip
    })

    const data = { nickname: result.nickname }

    afterRegistrationEvents({ nickname });

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: registerSchema
  })