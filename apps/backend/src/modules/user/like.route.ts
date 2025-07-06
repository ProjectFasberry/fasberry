import { throwError } from "#/helpers/throw-error";
import { cookieSetup } from "#/lib/middlewares/cookie";
import { sqlite } from "#/shared/database/sqlite-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { getExistSession } from "../private/validation.route";
import { auth } from "#/shared/database/auth-db";

const likes = new Elysia()
  .get("/rates/:nickname", async (ctx) => {
    const recipient = ctx.params.nickname;

    try {
      const query = await sqlite
        .selectFrom("likes")
        .select(sqlite.fn.countAll("likes").as("count"))
        .where("recipient", "=", recipient)
        .executeTakeFirst()

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: Number(query?.count ?? 0) })
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })

const like = new Elysia()
  .use(cookieSetup())
  .post("/rate/:nickname", async (ctx) => {
    const recipient = ctx.params.nickname;

    const query = await auth
      .selectFrom("sessions")
      .select("nickname")
      .where('token', "=", ctx.session!)
      .executeTakeFirst()

    if (!query?.nickname) return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR)

    const initiator = query.nickname

    if (initiator === recipient) {
      return ctx.status(HttpStatusEnum.HTTP_400_BAD_REQUEST, throwError("Dont like yourself"))
    }

    try {
      const result = await sqlite.transaction().execute(async (trx) => {
        const deleteResult = await trx
          .deleteFrom("likes")
          .where("initiator", "=", initiator)
          .where("recipient", "=", recipient)
          .executeTakeFirst();

        if (deleteResult.numDeletedRows > 0n) {
          return "unrated"
        } else {
          await trx
            .insertInto("likes")
            .values({ initiator, recipient })
            .execute();

          return "rated"
        }
      });

      return ctx.status(HttpStatusEnum.HTTP_200_OK, { data: result })
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

export const rateGroup = new Elysia()
  .use(like)
  .use(likes)