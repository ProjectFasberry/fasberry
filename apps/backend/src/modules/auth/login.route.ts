import Elysia, { t } from "elysia"
import bcrypt from 'bcryptjs';
import { UAParser } from 'ua-parser-js';
import { wrapError } from '#/helpers/wrap-error';
import { createSession, generateSessionToken, getExistsUser } from './auth.model';
import { HttpStatusEnum } from 'elysia-http-status-code/status';
import { CROSS_SESSION_KEY, SESSION_KEY, setCookie } from '#/utils/auth/cookie';
import { botValidator, validateAuthStatus } from "#/lib/middlewares/validators";
import { withData, withError } from "#/shared/schemas";
import { authSchema } from "@repo/shared/schemas/auth";

const loginSchema = authSchema

async function afterLoginEvents({ nickname }: { nickname: string }) {
  // todo: monitoring
  console.log("login", nickname)
}

export const login = new Elysia()
  .use(botValidator())
  .use(validateAuthStatus())
  .model({
    "login": withData(
      t.Object({
        nickname: t.String()
      })
    )
  })
  .resolve(({ headers }) => ({ userAgent: headers["user-agent"] }))
  .post("/login", async ({ cookie, status, body, ip, userAgent }) => {
    const { nickname, password } = body;

    const { hash, result: isExist } = await getExistsUser(nickname)

    if (!isExist) {
      throw status(HttpStatusEnum.HTTP_404_NOT_FOUND, wrapError("not-exists"))
    }

    const passwordIsValid = bcrypt.compareSync(password, hash)

    if (!passwordIsValid) {
      throw status(HttpStatusEnum.HTTP_400_BAD_REQUEST, wrapError("invalid"))
    }

    const token = generateSessionToken()
    const ua = UAParser(userAgent)

    const result = await createSession({ token, nickname, info: { ...ua, ip } })

    setCookie({ cookie, key: SESSION_KEY, expires: result.expires_at, value: token })
    // setCookie({ cookie, key: CROSS_SESSION_KEY, expires: result.expires_at, value: nickname })

    const data = { nickname: result.nickname }

    return { data }
  }, {
    body: loginSchema,
    response: {
      200: "login",
      400: withError,
      404: withError
    },
    afterResponse: ({ body: { nickname } }) => {
      afterLoginEvents({ nickname })
    }
  })