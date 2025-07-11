import Elysia from "elysia";
import { throwError } from "#/helpers/throw-error";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { sessionDerive } from "#/lib/middlewares/session";
import { userDerive } from "#/lib/middlewares/user";
import { getIsExistsSession } from "./auth.model";

export const validate = new Elysia()
  .use(sessionDerive())
  .use(userDerive())
  .get("/validate-session", async ({ cookie, nickname, session, ...ctx }) => {
    const token = session;

    if (!token) return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST)

    try {
      const data = await getIsExistsSession(token);

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    beforeHandle: async ({ session, ...ctx }) => {
      if (!session) {
        return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: false })
      }
    }
  })