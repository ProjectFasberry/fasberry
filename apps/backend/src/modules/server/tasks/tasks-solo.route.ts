import Elysia from "elysia";
import z from "zod";
import { general } from "#/shared/database/main-db";
import { withData } from "#/shared/schemas";
import { taskPayload } from "./tasks.model";

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

export const tasksSolo = new Elysia()
  .model({
    "task": withData(taskPayload)
  })
  .get("/:id", async ({ params }) => {
    const id = params.id;
    const data = await getTask(id);
    return { data }
  }, {
    params: z.object({
      id: z.coerce.number()
    }),
    response: {
      200: "task"
    }
  })