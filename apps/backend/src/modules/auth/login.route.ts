import { UAParser } from 'ua-parser-js';
import Elysia from "elysia"
import bcrypt from 'bcryptjs';
import { throwError } from '#/helpers/throw-error';
import { authSchema, createSession, getExistsUser } from './auth.model';
import { HttpStatusEnum } from 'elysia-http-status-code/status';
import { ipPlugin } from '#/lib/plugins/ip';
import { sessionDerive } from '#/lib/middlewares/session';
import { userDerive } from '#/lib/middlewares/user';
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { CROSS_SESSION_KEY, SESSION_KEY, setCookie } from '#/utils/auth/cookie';

const loginSchema = authSchema

function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
}

export const login = new Elysia()
  .use(ipPlugin())
  .use(userDerive())
  .use(sessionDerive())
  .post("/login", async ({ cookie, ...ctx }) => {
    const { nickname, password, token: cfToken } = ctx.body;

    // const result = await validateAuthenticationRequest({ token: cfToken, ip: ctx.ip })

    // if (result && "error" in result) {
    //   ctx.status(HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE)
    //   return { error: result.error }
    // }

    try {
      const existsUser = await getExistsUser(nickname)

      if (!existsUser.result) {
        return ctx.status(HttpStatusEnum.HTTP_404_NOT_FOUND, throwError("User not exists"))
      }

      const hash = existsUser.hash as string

      const passwordIsValid = bcrypt.compareSync(password, hash)

      if (!passwordIsValid) {
        return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError("Invalid password"))
      }

      const token = generateSessionToken()
      const ua = UAParser(ctx.headers["user-agent"])

      const result = await createSession({ token, nickname, info: { ...ua, ip: ctx.ip } })
      
      setCookie({ cookie, key: SESSION_KEY, expires: result.expires_at, value: token })
      setCookie({ cookie, key: CROSS_SESSION_KEY, expires: result.expires_at, value: nickname })

      const data = { nickname: result.nickname }

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    beforeHandle: async ({ nickname, ...ctx }) => {
      if (nickname) {
        return ctx.status(HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE, throwError("Authorized"))
      }
    },
    body: loginSchema
  })