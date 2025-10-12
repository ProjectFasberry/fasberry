import { general } from "#/shared/database/main-db";
import { getDirection } from "#/utils/config/paginate";
import { TasksPayload } from "@repo/shared/types/entities/other";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import { executeWithCursorPagination } from "kysely-paginate";
import z from "zod";

export const tasksList = new Elysia()
  .get("/list", async ({ status, query }) => {
    const { cursor, ascending } = query; 

    const baseQuery = general
      .selectFrom("tasks")
      .select([
        "id",
        "title",
        "description",
        "action_value",
        "reward_value",
        "reward_currency",
        "action_type",
        "created_at",
        'expires'
      ])

    const direction = getDirection(ascending)

    const result = await executeWithCursorPagination(baseQuery, {
      after: cursor,
      perPage: 32,
      fields: [
        { key: "created_at", expression: "created_at", direction }
      ], 
      parseCursor: (cursor) => ({
        created_at: new Date(cursor.created_at)
      })
    })

    const data: TasksPayload = {
      data: result.rows,
      meta: {
        hasNextPage: result.hasNextPage ?? false,
        hasPrevPage: result.hasPrevPage ?? false,
        endCursor: result.endCursor,
        startCursor: result.startCursor
      }
    }

    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    query: z.object({
      cursor: z.string().optional(),
      ascending: z.stringbool().optional().default(true)
    })
  })

async function getTask(id: number) {
  const query = await general
    .selectFrom("tasks")
    .select([
      "id",
      "title",
      "description",
      "action_value",
      "reward_value",
      "reward_currency",
      "action_type",
      "created_at",
      'expires'
    ])
    .where("id", "=", id)
    .executeTakeFirst()

  return query;
}

const tasksSolo = new Elysia()
  .get("/:id", async ({ params, status }) => {
    const id = params.id;
    const data = await getTask(id);
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    params: z.object({
      id: z.coerce.number()
    })
  })

export const tasks = new Elysia()
  .group("/task", app => app
    .use(tasksList)
    .use(tasksSolo)
  )