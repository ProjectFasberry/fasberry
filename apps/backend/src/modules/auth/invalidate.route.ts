import { throwError } from "#/helpers/throw-error";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { sessionDerive } from "#/lib/middlewares/session";
import { deleteSession } from "./auth.model";
import { userDerive } from "#/lib/middlewares/user";
import { CROSS_SESSION_KEY, SESSION_KEY, unsetCookie } from "#/utils/auth/cookie";

export const invalidate = new Elysia()
  .use(sessionDerive())
  .use(userDerive())
  .post("/invalidate-session", async ({ cookie, session, ...ctx }) => {
    try {
      const result = await deleteSession(session!);

      if (!result) {
        return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError("Internal Server Error"))
      }

      unsetCookie({ cookie, key: SESSION_KEY })
      unsetCookie({ cookie, key: CROSS_SESSION_KEY })

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: null, status: "success" })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    beforeHandle: async ({ nickname, session, ...ctx }) => {
      if (!nickname || !session) {
        return ctx.status(HttpStatusEnum.HTTP_401_UNAUTHORIZED, throwError("Session token not found"))
      }
    }
  })