import { throwError } from "#/helpers/throw-error";
import { auth } from "#/shared/database/auth-db";
import { encodeHexLowerCase } from "@oslojs/encoding";
import Elysia, { Cookie, t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { sha256 } from "@oslojs/crypto/sha2";
import { unsetCookie } from "#/helpers/cookie";

async function getSessionDetails(token: string) {
  const user = await auth
    .selectFrom("sessions")
    .select(['nickname', "ip"])
    .where("token", "=", token)
    .executeTakeFirst()

  if (!user) return null;

  return user;
}

export const deleteSession = async (sessionId: string) => {
  return auth
    .deleteFrom("sessions")
    .where("token", "=", sessionId)
    .executeTakeFirstOrThrow();
}

export async function invalidateSession(token: string) {
  const query = await auth
    .selectFrom("sessions")
    .select(auth.fn.countAll().as("count"))
    .where("token", "=", token)
    .$castTo<{ count: number }>()
    .executeTakeFirstOrThrow();

  if (!query.count) {
    throw new Error("Session not found");
  }

  return deleteSession(token);
}

export const invalidate = new Elysia()
  .post("/invalidate-session", async ({ cookie, ...ctx }) => {
    if (!cookie) {
      return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, { error: "s" })
    }

    const sessionToken = cookie.session.value

    if (!sessionToken) {
      return ctx.status(HttpStatusEnum.HTTP_401_UNAUTHORIZED, { error: "Session token not found" })
    }

    try {
      const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(sessionToken))
      );

      const result = await invalidateSession(sessionToken);

      if (!result) {
        return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, { error: "Internal Server Error" })
      }

      unsetCookie({ cookie, key: "session" })
      unsetCookie({ cookie, key: "logged_nickname" })

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: null, status: "success" })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })