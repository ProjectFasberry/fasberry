import Elysia, { t } from "elysia";
import { general } from "#/shared/database/main-db";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { defineUser } from "#/lib/middlewares/define";
import { wrapError } from "#/helpers/wrap-error";
import { withData } from "#/shared/schemas";

const likes = new Elysia()
  .model({
    "like": withData(
      t.Object({
        data: t.Array(
          t.Object({
            initiator: t.String(),
            created_at: t.Date(),
          })
        ),
        meta: t.Object({
          count: t.Number()
        })
      })
    )
  })
  .get("/list/:nickname", async ({ params }) => {
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

    return { data: response }
  }, {
    response: {
      200: "like"
    }
  })

const like = new Elysia()
  .use(defineUser())
  .model({
    "post-like": withData(
      t.UnionEnum(["unrated", "rated"])
    )
  })
  .post("/:nickname", async ({ nickname: initiator, status, params }) => {
    const recipient = params.nickname;

    if (initiator === recipient) {
      return status(HttpStatusEnum.HTTP_400_BAD_REQUEST, wrapError("Dont like yourself"))
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

    return { data: result }
  }, {
    response: {
      200: "post-like",
      400: t.Object({ error: t.String() })
    }
  })

export const rate = new Elysia()
  .group("/rate", app => app
    .use(likes)
    .use(like)
  )