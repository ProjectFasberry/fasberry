import Elysia, { t } from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { deleteSession } from "./auth.model";
import { CROSS_SESSION_KEY, SESSION_KEY, unsetCookie } from "#/utils/auth/cookie";
import { defineUser } from "#/lib/middlewares/define";
import { withData, withError } from "#/shared/schemas";
import { wrapError } from "#/helpers/wrap-error";

export const invalidate = new Elysia()
  .use(defineUser())
  .model({
    "invalidate": withData(
      t.Boolean()
    )
  })
  .derive(async ({ session, status }) => {
    if (!session) {
      throw status(HttpStatusEnum.HTTP_401_UNAUTHORIZED)
    }

    return { session }
  })
  .post("/invalidate-session", async ({ cookie, session, status }) => {
    const result = await deleteSession(session);

    if (!result) {
      throw status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, wrapError("Session is not deleted"))
    }

    unsetCookie({ cookie, key: SESSION_KEY })
    unsetCookie({ cookie, key: CROSS_SESSION_KEY })

    return { data: true }
  }, {
    response: {
      200: "invalidate",
      500: withError
    }
  })