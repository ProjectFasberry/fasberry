import Elysia from "elysia"
import bcrypt from 'bcryptjs';
import { UAParser } from 'ua-parser-js';
import { throwError } from '#/helpers/throw-error';
import { authSchema, createSession, getExistsUser, getUserNickname } from './auth.model';
import { HttpStatusEnum } from 'elysia-http-status-code/status';
import { ipPlugin } from '#/lib/plugins/ip';
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { CROSS_SESSION_KEY, SESSION_KEY, setCookie } from '#/utils/auth/cookie';
import { defineSession } from "#/lib/middlewares/define";
import { createEvent } from "../server/events.route";

const loginSchema = authSchema

function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
}

export const validateAuthStatus = () => new Elysia()
  .use(defineSession())
  .onBeforeHandle(async ({ session: token, status }) => {
    if (token) {
      const nickname = await getUserNickname(token);

      if (nickname) {
        return status(HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE, throwError("Authorized"))
      }
    }
  })

export const login = new Elysia()
  .use(ipPlugin())
  .use(validateAuthStatus())
  .post("/login", async ({ cookie, status, body, ...ctx }) => {
    const { nickname, password, token: cfToken } = body;

    // const result = await validateAuthenticationRequest({ token: cfToken, ip: ctx.ip })

    // if (result && "error" in result) {
    //   ctx.status(HttpStatusEnum.HTTP_406_NOT_ACCEPTABLE)
    //   return { error: result.error }
    // }

    const existsUser = await getExistsUser(nickname)

    if (!existsUser.result) {
      return status(HttpStatusEnum.HTTP_404_NOT_FOUND, throwError("User not exists"))
    }

    const hash = existsUser.hash as string

    const passwordIsValid = bcrypt.compareSync(password, hash)

    if (!passwordIsValid) {
      return status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError("Invalid password"))
    }

    const token = generateSessionToken()
    const userAgentHeader = ctx.headers["user-agent"];
    const ua = UAParser(userAgentHeader)

    const result = await createSession({ token, nickname, info: { ...ua, ip: ctx.ip } })

    setCookie({ cookie, key: SESSION_KEY, expires: result.expires_at, value: token })
    setCookie({ cookie, key: CROSS_SESSION_KEY, expires: result.expires_at, value: nickname })

    const data = { nickname: result.nickname }

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    body: loginSchema
  })