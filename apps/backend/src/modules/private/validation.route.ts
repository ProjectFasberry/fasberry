import Elysia from "elysia";
import { throwError } from "#/helpers/throw-error";
import { sessionDerive } from "#/lib/middlewares/session";
import { userDerive } from "#/lib/middlewares/user";
import { main } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";

export const privateValidate = new Elysia()
  .use(sessionDerive())
  .use(userDerive())
  .get('/validate', async ({ nickname, ...ctx }) => {
    try {
      const result = await main
        .selectFrom("admins")
        .select("id")
        .where("nickname", "=", nickname)
        .executeTakeFirst()

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: Boolean(result?.id) })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    beforeHandle: async ({ nickname, ...ctx }) => {
      if (!nickname) {
        return ctx.status(HttpStatusEnum.HTTP_401_UNAUTHORIZED, throwError("Unauthorized"))
      }
    },
  })

export const validateGroup = new Elysia()
  .group("/private", ctx => ctx
    .use(privateValidate)
  )