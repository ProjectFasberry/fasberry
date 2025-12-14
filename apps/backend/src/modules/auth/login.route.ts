import Elysia, { t } from "elysia"
import bcrypt from 'bcryptjs';
import { wrapError } from '#/helpers/wrap-error';
import { createSession, getExistsUser } from './auth.model';
import { HttpStatusEnum } from 'elysia-http-status-code/status';
import { SESSION_KEY, setCookie } from '#/utils/auth/cookie';
import { botValidator, validateAuthStatus } from "#/lib/middlewares/validators";
import { withData, withError } from "#/shared/schemas";
import { authSchema } from "@repo/shared/schemas/auth";

const loginSchema = authSchema

export const login = new Elysia()
  .use(botValidator())
  .use(validateAuthStatus())
  .model({
    "login": withData(t.Object({ nickname: t.String() }))
  })
  .resolve(({ headers }) => ({ userAgent: headers["user-agent"] }))
  .post("/login", async ({ cookie, status, body: { nickname, password }, ip, userAgent: userAgentStr }) => {
    const { hash, result: isExist } = await getExistsUser(nickname)

    if (!isExist) {
      throw status(HttpStatusEnum.HTTP_404_NOT_FOUND, wrapError("not-exists"))
    }

    const passwordIsValid = bcrypt.compareSync(password, hash)

    if (!passwordIsValid) {
      throw status(HttpStatusEnum.HTTP_400_BAD_REQUEST, wrapError("invalid"))
    }

    const { expires_at: expires, token } = await createSession({
      nickname, userAgentStr, ip
    })

    setCookie({ cookie, key: SESSION_KEY, expires, value: token })

    const data = { nickname }
    return { data }
  }, {
    body: loginSchema,
    response: {
      200: "login",
      400: withError,
      404: withError
    }
  })