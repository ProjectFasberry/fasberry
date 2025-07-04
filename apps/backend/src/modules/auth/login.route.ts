import { UAParser } from 'ua-parser-js';
import Elysia from "elysia"
import { auth } from "#/shared/database/auth-db"
import bcrypt from 'bcryptjs';
import { throwError } from '#/helpers/throw-error';
import { authSchema, createSession, DEFAULT_SESSION_EXPIRE, getExistsUser } from './auth.model';
import { generateSessionToken } from '#/utils/auth/generate-session-token';
import { HttpStatusEnum } from 'elysia-http-status-code/status';
import { setCookie } from '#/helpers/cookie';
import { ipSetup } from '#/lib/middlewares/ip';
import { cookieSetup } from '#/lib/middlewares/cookie';

const loginSchema = authSchema

export const login = new Elysia()
  .use(ipSetup())
  .use(cookieSetup())
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

      const expires_at = new Date(Date.now() + DEFAULT_SESSION_EXPIRE);

      const result = await createSession({
        token, nickname, expires_at, info: { ...ua, ip: ctx.ip }
      })

      setCookie({ cookie, key: "session", expires: expires_at, value: token })
      setCookie({ cookie, key: "logged_nickname", expires: expires_at, value: nickname })

      const data = { id: result.id, nickname: result.nickname }

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    beforeHandle: async ({ session, ...ctx }) => {
      const existsSession = await auth
        .selectFrom('sessions')
        .select(auth.fn.countAll("sessions").as("count"))
        .where("token", "=", session)
        .executeTakeFirst()

      if (existsSession && Number(existsSession.count)) {
        return ctx.status(HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE, throwError("You are authorized"))
      }
    },
    body: loginSchema
  })