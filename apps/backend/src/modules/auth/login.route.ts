import { UAParser } from 'ua-parser-js';
import Elysia, { Cookie, t } from "elysia"
import { auth } from "#/shared/auth-db"
import bcrypt from 'bcryptjs';
import { throwError } from '#/helpers/throw-error';
import { authSchema, createSession, DEFAULT_SESSION_EXPIRE, getExistsUser } from './auth.model';
import { generateSessionToken } from '#/utils/auth/generate-session-token';
import { HttpStatusEnum } from 'elysia-http-status-code/status';
import { ip } from 'elysia-ip';
import { setCookie } from '#/helpers/cookie';

const loginSchema = authSchema

export const login = new Elysia()
  .use(ip({ checkHeaders: ["X-Forwarded-For", "X-Real-IP"] }))
  .post("/login", async ({ cookie, ...ctx }) => {
    const { nickname, password, token: cfToken } = ctx.body;

    // const result = await validateAuthenticationRequest({ token: cfToken, ip: ctx.ip })

    // if (result && "error" in result) {
    //   ctx.status(HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE)
    //   return { error: result.error }
    // }

    const existsUser = await getExistsUser(nickname)

    if (!existsUser.result) {
      ctx.status(404)
      return { error: "User not exists" }
    }

    const hash = existsUser.hash as string

    const passwordIsValid = bcrypt.compareSync(password, hash)

    if (!passwordIsValid) {
      ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST)
      return { error: "Invalid password" }
    }

    const token = generateSessionToken()
    const ua = UAParser(ctx.headers["user-agent"])

    try {
      const expires_at = new Date(Date.now() + DEFAULT_SESSION_EXPIRE);

      const result = await createSession({
        token, nickname, expires_at, info: { ...ua, ip: ctx.ip }
      })

      ctx.status(HttpStatusEnum.HTTP_200_OK)

      setCookie({ cookie, key: "session", expires: expires_at, value: token })
      setCookie({ cookie, key: "logged_nickname", expires: expires_at, value: nickname })

      return { data: { id: result.id, nickname: result.nickname } }
    } catch (e) {
      ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR)
      
      return throwError(e)
    }
  }, {
    beforeHandle: async ({ session, ...ctx }) => {
      console.log("auth.onRequest.session", session)

      const existsSession = await auth
        .selectFrom('sessions')
        .select(auth.fn.countAll("sessions").as("count"))
        .where("token", "=", session)
        .executeTakeFirst()

      if (existsSession && Number(existsSession.count)) {
        ctx.status(HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE)
        return { error: "You are authorized" }
      }
    },
    body: loginSchema
  })