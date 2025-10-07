import { general } from "#/shared/database/main-db";
import Elysia from "elysia";
import { HttpStatusEnum } from "elysia-http-status-code/status";
import z from "zod";

async function deleteNews(id: number) {
  const query = await general
    .deleteFrom("news")
    .where("id", "=", id)
    .returning(["id"])
    .executeTakeFirstOrThrow()

  return query
}

export const newsDeleteRoute = new Elysia()
  .delete("/:id", async ({ status, params }) => {
    const id = params.id;
    const data = await deleteNews(id);
    return status(HttpStatusEnum.HTTP_200_OK, { data })
  }, {
    params: z.object({
      id: z.coerce.number()
    })
  })