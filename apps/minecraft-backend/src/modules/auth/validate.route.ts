import { isProduction } from "#/helpers/is-production";
import { throwError } from "#/helpers/throw-error";
import { validateSessionToken } from "#/utils/auth/validate-session-token";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { auth } from "#/shared/auth-db";

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
  .state("sessionToken", "test")
  .state("nickname", "test")
  .get("/validate-session", async ({ cookie, ...ctx }) => {
    const token = cookie.session.value
    const nickname = ctx.store.nickname

    try {
      // const nickname = await getNicknameByTokenFromKv(token);

      if (!nickname || !token) {
        const session = await validateSessionToken(token as string);

        if (!session) {
          ctx.status(HttpStatusEnum.HTTP_401_UNAUTHORIZED)
          return { error: "Invalid session token" }
        }

        cookie.session.httpOnly = true
        cookie.session.sameSite = "lax"
        cookie.session.domain = SESSION_DOMAIN
        cookie.session.secure = isProduction()
        cookie.session.expires = new Date(session.expires_at)
        cookie.session.path = "/"
        cookie.session.value = token
      }

      ctx.status(HttpStatusEnum.HTTP_200_OK)
      
      return { data: true, status: "success" }
    } catch (e) {
      ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR)
      return { error: throwError(e) }
    }
  }, {
    beforeHandle: async (ctx) => {
      const token = ctx.cookie["session"].value

      if (!token) {
        return { error: "Unauthorized"}
      }

      const session = await getUserSession(token)

      if (!session) {
        return { error: "Unauthorized" }
      }
    }
  })