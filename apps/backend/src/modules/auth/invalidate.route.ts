import Elysia from "elysia"; 
import { throwError } from "#/helpers/throw-error";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { deleteSession } from "./auth.model";
import { CROSS_SESSION_KEY, SESSION_KEY, unsetCookie } from "#/utils/auth/cookie";
import { defineUser } from "#/lib/middlewares/define";

export const invalidate = new Elysia()
  .use(defineUser())
  .derive(async ({ session, status }) => {
    if (!session) {
      throw status(HttpStatusEnum.HTTP_401_UNAUTHORIZED)
    }

    return { session }
  })
  .post("/invalidate-session", async ({ cookie, session, status }) => {
    const result = await deleteSession(session);

    if (!result) {
      return status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError("Internal Server Error"))
    }

    unsetCookie({ cookie, key: SESSION_KEY })
    unsetCookie({ cookie, key: CROSS_SESSION_KEY })

    const data = { data: null, status: "success" }

    return status(HttpStatusEnum.HTTP_200_OK, data)
  })