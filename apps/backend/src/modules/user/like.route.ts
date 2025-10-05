import Elysia from "elysia";
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { defineUser } from "#/lib/middlewares/define";

const likes = new Elysia()
  .get("/rates/:nickname", async ({ status, params }) => {
    const recipient = params.nickname;

    const query = await general
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

    const data = query.map(item => ({ initiator: item.initiator, created_at: item.created_at }))
    const count: number = Number(query[0]?.total_count ?? 0)

    const response = {
      data,
      meta: {
        count
      }
    }

    return status(HttpStatusEnum.HTTP_200_OK, { data: response })
  })

const like = new Elysia()
  .use(defineUser())
  .post("/rate/:nickname", async ({ nickname: initiator, status, params }) => {
    const recipient = params.nickname;

    if (initiator === recipient) {
      return status(HttpStatusEnum.HTTP_400_BAD_REQUEST, "Dont like yourself")
    }

    const result = await general.transaction().execute(async (trx) => {
      const del = await trx
        .deleteFrom("likes")
        .where("initiator", "=", initiator)
        .where("recipient", "=", recipient)
        .executeTakeFirst();

      if (del.numDeletedRows) {
        return "unrated";
      }

      const upd = await trx
        .insertInto("likes")
        .values({ initiator, recipient })
        .executeTakeFirst();

      if (!upd.numInsertedOrUpdatedRows) {
        throw new Error("Rating is not updated")
      }

      return "rated"
    });

    const data = result;

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  })

export const rate = new Elysia()
  .use(like)
  .use(likes)