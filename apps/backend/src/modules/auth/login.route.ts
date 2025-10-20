import Elysia, { t } from "elysia"
import bcrypt from 'bcryptjs';
import { UAParser } from 'ua-parser-js';
import { wrapError } from '#/helpers/wrap-error';
import { createSession, getExistsUser } from './auth.model';
import { HttpStatusEnum } from 'elysia-http-status-code/status';
import { ipPlugin } from '#/lib/plugins/ip';
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { CROSS_SESSION_KEY, SESSION_KEY, setCookie } from '#/utils/auth/cookie';
import { validateAuthStatus } from "#/lib/middlewares/validators";
import { authSchema } from "@repo/shared/types/entities/auth";
import { withData, withError } from "#/shared/schemas";

const loginSchema = authSchema

function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
}

export const login = new Elysia()
  .use(ipPlugin())
  .use(validateAuthStatus())
  .model({
    "login": withData(
      t.Object({
        nickname: t.String()
      })
    )
  })
  .post("/login", async ({ cookie, status, body, ...ctx }) => {
    const { nickname, password, token: cfToken } = body;

    // const result = await validateAuthenticationRequest({ token: cfToken, ip: ctx.ip })

    // if (result && "error" in result) {
    //   ctx.status(HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE)
    //   return { error: result.error }
    // }

    const existsUser = await getExistsUser(nickname)

    if (!existsUser.result) {
      return status(HttpStatusEnum.HTTP_404_NOT_FOUND, wrapError("User not exists"))
    }

    const hash = existsUser.hash as string

    const passwordIsValid = bcrypt.compareSync(password, hash)

    if (!passwordIsValid) {
      return status(HttpStatusEnum.HTTP_400_BAD_REQUEST, wrapError("Invalid password"))
    }

    const token = generateSessionToken()
    const userAgentHeader = ctx.headers["user-agent"];
    const ua = UAParser(userAgentHeader)

    const result = await createSession({ token, nickname, info: { ...ua, ip: ctx.ip } })

    setCookie({ cookie, key: SESSION_KEY, expires: result.expires_at, value: token })
    setCookie({ cookie, key: CROSS_SESSION_KEY, expires: result.expires_at, value: nickname })

    const data = { nickname: result.nickname }

    return { data }
  }, {
    body: loginSchema,
    response: {
      200: "login",
      400: withError,
      404: withError
    }
  })