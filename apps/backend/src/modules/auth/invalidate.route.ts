import { throwError } from "#/helpers/throw-error";
import { auth } from "#/shared/auth-db";
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
      ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST)
      return { error: "s" }
    }

    const sessionToken = cookie.session.value

    if (!sessionToken) {
      ctx.status(HttpStatusEnum.HTTP_401_UNAUTHORIZED)
      return { error: "Session token not found" }
    }

    let sessionDetails: { nickname: string; ip: string; } | null = null;

    try {
      const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(sessionToken))
      );

      sessionDetails = await getSessionDetails(sessionId);

      const result = await invalidateSession(sessionToken);

      if (!result) {
        ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR)
        return { error: "Internal Server Error" }
      }

      // if (sessionDetails) {
      //   logger.info(`${sessionDetails.nickname} logged. Ip: ${sessionDetails.ip} Time: ${dayjs().format("DD-MM-YYYY HH:mm:ss")}`)
      // }

      unsetCookie({ cookie, key: "session" })
      unsetCookie({ cookie, key: "logged_nickname" })

      ctx.status(HttpStatusEnum.HTTP_200_OK)

      return { data: null, status: "success" }
    } catch (e) {
      ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR)
      return { error: throwError(e) }
    }
  })