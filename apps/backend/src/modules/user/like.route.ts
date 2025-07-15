import { throwError } from "#/helpers/throw-error";
import { sessionDerive } from "#/lib/middlewares/session";
import { userDerive } from "#/lib/middlewares/user";
import { sqlite } from "#/shared/database/sqlite-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";

const likes = new Elysia()
  .get("/rates/:nickname", async (ctx) => {
    const recipient = ctx.params.nickname;

    try {
      const query = await sqlite
        .selectFrom("likes")
        .select(eb => [
          "initiator",
          "created_at",
          eb.fn.countAll().over().as('total_count')
        ])
        .where("recipient", "=", recipient)
        .limit(8)
        .orderBy("created_at", "desc")
        .execute()

      const count = Number(query[0]?.total_count) ?? 0

      const data = {
        data: query.map(item => ({ initiator: item.initiator, created_at: item.created_at })),
        meta: {
          count
        }
      }

      return ctx.status(HttpStatusEnum.HTTP_200_OK, data)
    } catch (e) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR, throwError(e))
    }
  })

const like = new Elysia()
  .use(sessionDerive())
  .use(userDerive())
  .post("/rate/:nickname", async ({ nickname: initiator, ...ctx }) => {
    const recipient = ctx.params.nickname;

    if (!initiator) {
      return ctx.status(HttpStatusEnum.HTTP_500_INTERNAL_SERVER_ERROR)
    }

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
    beforeHandle: async ({ nickname, ...ctx }) => {
      if (!nickname) {
        return ctx.status(HttpStatusEnum.HTTP_401_UNAUTHORIZED, throwError("Unauthorized"))
      }
    },
  })

export const rateGroup = new Elysia()
  .use(like)
  .use(likes)