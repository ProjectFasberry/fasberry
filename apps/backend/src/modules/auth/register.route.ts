import Elysia, { t } from "elysia";
import { createUser, getExistsUser, getUserUUID, validatePasswordSafe } from "./auth.model";
import { wrapError } from "#/helpers/wrap-error";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { general } from "#/shared/database/main-db";
import { createEvent } from "../server/events/events.model";
import { botValidator, validateAuthStatus } from "#/lib/middlewares/validators";
import { withData, withError } from "#/shared/schemas";
import { registerSchema } from "@repo/shared/schemas/auth"
import { ipPlugin } from "#/lib/plugins/ip";

function afterRegistrationEvents({ nickname }: { nickname: string }) {
  createEvent({
    description: `Игрок ${nickname} был зарегистрирован`,
    type: "log",
    initiator: "system",
    title: "Регистрация"
  })
}

const registerValidator = () => new Elysia()
  .onBeforeHandle(async ({ status }) => {
    const query = await general
      .selectFrom("options")
      .select("value")
      .where("name", "=", "registrationEnabled")
      .executeTakeFirst()

    const isEnabled = Boolean(query?.value)

    if (!isEnabled) {
      throw status(HttpStatusEnum.HTTP_400_BAD_REQUEST, "authorization-disabled")
    }
  })
  .as("scoped")

const MAX_USERS_PER_IP = 3;

async function validateIpRestricts(ip: string): Promise<boolean> {
  const result = await general
    .selectFrom("AUTH")
    .select(general.fn.countAll().as("count"))
    .where("IP", "=", ip)
    .$castTo<{ count: number }>()
    .executeTakeFirst();

  if (!result) return false;

  return result.count > MAX_USERS_PER_IP;
}

const ipValidator = () => new Elysia()
  .use(ipPlugin())
  .onBeforeHandle(async ({ ip, status }) => {
    const isValid = await validateIpRestricts(ip)

    if (isValid) {
      throw status(HttpStatusEnum.HTTP_400_BAD_REQUEST, wrapError("ip-limit"))
    }
  })
  .as("scoped")

export const register = new Elysia()
  .use(botValidator())
  .use(registerValidator())
  .use(validateAuthStatus())
  .use(ipValidator())
  .model({
    "register": withData(
      t.Object({
        nickname: t.String()
      })
    )
  })
  .post("/register", async ({ status, body, ip }) => {
    const { findout, nickname, password, findoutType } = body

    const existsUser = await getExistsUser(nickname)

    if (existsUser.result) {
      throw status(HttpStatusEnum.HTTP_400_BAD_REQUEST, wrapError("exists"))
    }

    const isPasswordSafe = validatePasswordSafe(password)

    if (!isPasswordSafe) {
      throw status(HttpStatusEnum.HTTP_400_BAD_REQUEST, wrapError("unsafe"))
    }

    const uuid = await getUserUUID(nickname)

    const hash = Bun.password.hashSync(password, {
      algorithm: "bcrypt", cost: 10
    })

    await createUser({
      nickname, findout, uuid, findoutType, password: hash, ip
    })

    const data = { nickname }
    return { data }
  }, {
    body: registerSchema,
    response: {
      200: "register",
      409: withError,
      400: withError,
    },
    afterResponse: ({ body: { nickname } }) => {
      afterRegistrationEvents({ nickname })
    }
  })