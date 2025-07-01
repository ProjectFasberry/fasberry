import { isProduction } from "#/helpers/is-production";
import { throwError } from "#/helpers/throw-error";
import { validateSessionToken } from "#/utils/auth/validate-session-token";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { auth } from "#/shared/database/auth-db";
import { cookieSetup } from "../global/setup";

export const SESSION_DOMAIN = "mc.fasberry.su"
export const SESSION_KEY = "session"

export async function getUserSession(token: string) {
  return auth
    .selectFrom("sessions")
    .select("nickname")
    .where("token", "=", token)
    .executeTakeFirst();
}

export const validate = new Elysia()
  .use(cookieSetup)
  .get("/validate-session", async ({ cookie, ...ctx }) => {
    const token = cookie.session.value
    // const nickname = ctx.store.nickname

    const nickname = "Test"
    
    try {
      // const nickname = await getNicknameByTokenFromKv(token);

      if (!nickname || !token) {
        const session = await validateSessionToken(token as string);

        if (!session) {
          return ctx.status(HttpStatusEnum.HTTP_401_UNAUTHORIZED, { error: "Invalid session token" })
        }

        cookie.session.httpOnly = true
        cookie.session.sameSite = "lax"
        cookie.session.domain = SESSION_DOMAIN
        cookie.session.secure = isProduction()
        cookie.session.expires = new Date(session.expires_at)
        cookie.session.path = "/"
        cookie.session.value = token
      }

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: true, status: "success" })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    beforeHandle: async (ctx) => {
      const token = ctx.cookie["session"].value

      if (!token) {
        return { error: "Unauthorized" }
      }

      const session = await getUserSession(token)

      if (!session) {
        return { error: "Unauthorized" }
      }
    }
  })