import Elysia, { t } from "elysia";
import { createUser, generateOfflineUUID, getExistsUser } from "./auth.model";
import { wrapError } from "#/helpers/wrap-error";
import { validateAuthenticationRequest } from "#/utils/auth/validate-auth-request";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { ipPlugin } from "#/lib/plugins/ip";
import { logger } from "#/utils/config/logger";
import { textSets } from "#/utils/minio/load-internal-files";
import { general } from "#/shared/database/main-db";
import { createEvent } from "../server/events/events.model";
import { validateAuthStatus } from "#/lib/middlewares/validators";
import { registerSchema } from "@repo/shared/types/entities/auth";
import { withData, withError } from "#/shared/schemas";
import { client } from "#/shared/api/client";

const MOJANG_API_URL = "https://api.ashcon.app/mojang/v2/user"

type MojangPayload =
  | { uuid: string }
  | { reason: string, error: string }

async function getLicense(nickname: string) {
  const result = await client.get(`${MOJANG_API_URL}/${nickname}`, { throwHttpErrors: false, timeout: 5000 }).json<MojangPayload>();
  return result
}

export function validatePasswordSafe(pwd: string): boolean {
  const unsafePasswords = textSets["unsafe_passwords.txt"];
  return !unsafePasswords.has(pwd.trim())
}

async function getUserUUID(nickname: string) {
  let uuid: string | null = null;
  let type: "offline" | "license" = "license"

  try {
    const license = await getLicense(nickname)

    if ("error" in license) {
      type = "offline";
      throw new Error(license.reason)
    }

    if (license.uuid) {
      uuid = license.uuid
    }
  } catch (e) {
    // generate offline uuid if user is not licensed
    uuid = generateOfflineUUID(nickname)
  }

  logger.log(`Player ${nickname} has a ${type} account`)

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
    description: `Игрок ${nickname} был зарегистрирован`,
    type: "log",
    initiator: "system",
    title: "Регистрация"
  })
}

export const register = new Elysia()
  .use(ipPlugin())
  .use(validateAuthStatus())
  .post("/register", async ({ status, ...ctx }) => {
    const { findout, nickname, password, token: cfToken, findoutType } = ctx.body

    const registrationIsEnabled = await checkRegistrationState();

    if (!registrationIsEnabled) {
      return status(HttpStatusEnum.HTTP_400_BAD_REQUEST, wrapError("Authorization is disabled"));
    }

    // const validateResult = await validateAuthenticationRequest({ token: cfToken, ip: ctx.ip })

    // if (validateResult && "error" in validateResult) {
    //   return ctx.status(HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE, throwError(validateResult.error))
    // }

    const existsUser = await getExistsUser(nickname)

    if (existsUser.result) {
      return status(HttpStatusEnum.HTTP_400_BAD_REQUEST, wrapError("User already exists"))
    }

    const isPasswordSafe = validatePasswordSafe(password)

    if (!isPasswordSafe) {
      return status(HttpStatusEnum.HTTP_400_BAD_REQUEST, wrapError("Unsafe password"))
    }

    const uuid = await getUserUUID(nickname)

    if (!uuid) {
      return status(HttpStatusEnum.HTTP_409_CONFLICT, wrapError("UUID must be required"))
    }

    const hash = Bun.password.hashSync(password, {
      algorithm: "bcrypt", cost: 10
    })

    const result = await createUser({
      nickname, findout, uuid, findoutType, password: hash, ip: ctx.ip
    })

    const data = { nickname: result.nickname }

    afterRegistrationEvents({ nickname });

    return { data }
  }, {
    body: registerSchema,
    response: {
      200: withData(
        t.Object({
          nickname: t.String()
        })
      ),
      409: withError,
      400: withError,
    }
  })