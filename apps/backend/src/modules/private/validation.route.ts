import { throwError } from "#/helpers/throw-error";
import { cookieSetup } from "#/lib/middlewares/cookie";
import { auth } from "#/shared/database/auth-db";
import { sqlite } from "#/shared/database/sqlite-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";

export async function getExistSession(token: string) {
  return auth
    .selectFrom('sessions')
    .select(auth.fn.countAll("sessions").as("count"))
    .where("token", "=", token)
    .executeTakeFirst()
}

export const privateValidate = new Elysia()
  .use(cookieSetup())
  .get('/validate', async (ctx) => {
    const token = ctx.session!;

    const query = await auth
      .selectFrom("sessions")
      .select("nickname")
      .where("token", "=", token)
      .executeTakeFirst()

    if (!query) return ctx.status(HttpStatusEnum.HTTP_401_UNAUTHORIZED, { data: false })

    try {
      const result = await sqlite
        .selectFrom("admins")
        .select("id")
        .where("nickname", "=", query.nickname)
        .executeTakeFirst()

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: Boolean(result?.id) })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  }, {
    beforeHandle: async ({ session, ...ctx }) => {
      if (!session) {
        return ctx.status(HttpStatusEnum.HTTP_401_UNAUTHORIZED, throwError("Unauthorized"))
      }

      const existsSession = await getExistSession(session)

      if (!existsSession || !Number(existsSession.count)) {
        return ctx.status(HttpStatusEnum.HTTP_401_UNAUTHORIZED, throwError("Unauthorized"))
      }
    },
  })

export const validateGroup = new Elysia()
  .group("/private", ctx => ctx
    .use(privateValidate)
  )